import os
import io
import re
import requests
import fitz  # PyMuPDF
import google.generativeai as genai
from llama_index.llms.groq import Groq
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.schema import Document
from llama_index.core.node_parser import SentenceSplitter
from PIL import Image
from supabase import create_client, Client
from dotenv import load_dotenv
import time

load_dotenv()

# Setup your Supabase client using environment variables or hardcoded values
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Constants
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_PATH = "sentence-transformers/all-mpnet-base-v2"  # Updated embedding model

# Configure Gemini for image-to-text
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel("gemini-2.0-flash")

class Settings:
    embed_model = None
    llm = None
    node_parser = None

# Rate limiting constants (in seconds)
RATE_LIMIT_DELAY = 1.0   # Delay after each successful call
RETRY_DELAY = 5.0        # Delay when a 429 error is encountered

def process_image_with_rate_limiting(prompt, image_pil, gemini_model):
    """
    Process an image using the Gemini model with basic rate limiting.
    If a 429 error occurs, waits and retries once.
    """
    try:
        response = gemini_model.generate_content([prompt, image_pil])
        response.resolve()
        result_text = response.text if hasattr(response, 'text') and response.text else "No description available."
        time.sleep(RATE_LIMIT_DELAY)
        return result_text
    except Exception as e:
        # Check if the error message indicates a 429 (rate limit) error
        if "429" in str(e):
            print("Received 429 error, waiting", RETRY_DELAY, "seconds before retrying...")
            time.sleep(RETRY_DELAY)
            try:
                response = gemini_model.generate_content([prompt, image_pil])
                response.resolve()
                result_text = response.text if hasattr(response, 'text') and response.text else "No description available."
                time.sleep(RATE_LIMIT_DELAY)
                return result_text
            except Exception as retry_e:
                print("Retry failed:", retry_e)
                time.sleep(RATE_LIMIT_DELAY)
                return "Error generating description."
        else:
            print("Error processing image:", e)
            time.sleep(RATE_LIMIT_DELAY)
            return "Error generating description."

def extract_pdf_content_from_bytes(pdf_bytes):
    """
    Extract text, LaTeX expressions, and diagram descriptions from PDF bytes.
    Processing is done entirely in memory.
    """
    pdf_file = fitz.open(stream=io.BytesIO(pdf_bytes), filetype="pdf")
    text = ""
    latex_expressions = []
    image_descriptions = []
    
    for page in pdf_file:
        page_text = page.get_text("text")
        text += page_text
        latex_expressions.extend(re.findall(r'\$([^$]+)\$', page_text))
        
        for img in page.get_images(full=True):
            xref = img[0]
            base_image = pdf_file.extract_image(xref)
            image_bytes = base_image["image"]
            try:
                image_pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")
                prompt = "Describe the diagram and explain what it represents."
                description = process_image_with_rate_limiting(prompt, image_pil, gemini_model)
            except Exception as e:
                print(f"Error processing image on page: {str(e)}")
                description = "Error generating description."
            image_descriptions.append(description)
    
    return text, latex_expressions, image_descriptions

def extract_latex_from_text(text):
    """Extract LaTeX expressions using regex."""
    return re.findall(r'\$([^$]+)\$', text)

def store_vector(document_id: str, text_content: str, embedding: list, user_id: str):
    """
    Insert a document's text and its embedding into the 'vectors' table in Supabase,
    along with the user_id.
    """
    data = {
        "document_id": document_id,
        "text_content": text_content,
        "embedding": embedding,  # Ensure this matches your table's vector type.
        "user_id": user_id
    }
    response = supabase.table("vectors").insert(data).execute()
    if hasattr(response, 'error') and response.error:
        print("Error storing vector:", response.error)
    else:
        print("Stored vector successfully:", response.data)

def check_user_vectors(user_id: str) -> bool:
    """
    Check if there are any vectors already stored in Supabase for the given user.
    Returns True if at least one vector exists, otherwise False.
    """
    response = supabase.table("vectors").select("*").eq("user_id", user_id).execute()
    if hasattr(response, 'error') and response.error:
        print("Error checking vectors:", response.error)
        return False
    if response.data and len(response.data) > 0:
        return True
    return False

def create_vector_index_from_url(file_url: str, user_id: str):
    """
    Create a vector index from a PDF file at the given cloud URL.
    The file is downloaded, processed entirely in memory, and its vector
    representation is stored in Supabase under the specified user.
    """
    response = requests.get(file_url)
    if response.status_code != 200:
        print("Error: Failed to download file from URL")
        return

    pdf_bytes = response.content
    text, latex_expressions, image_descriptions = extract_pdf_content_from_bytes(pdf_bytes)
    
    # Combine all extracted content into a single text representation
    full_content = text + "\n" + "\n".join(latex_expressions) + "\n" + "\n".join(image_descriptions)
    
    # Create a Document object with the combined content and metadata
    document = Document(text=full_content, metadata={"source": file_url})
    
    # Setup embedding model & LLM for generating the embedding
    embed_model = HuggingFaceEmbedding(model_name=MODEL_PATH)
    llm = Groq(model="llama3-70b-8192", api_key=GROQ_API_KEY)
    
    # Use _embed() instead of embed() since embed() is not available.
    embedding = embed_model._embed([document.text])[0]  # returns a list of floats
    
    # Store the vector in Supabase with the user_id
    store_vector(document.metadata.get("source", "unknown"), document.text, embedding, user_id)
    
    # Update Settings for any further processing if needed
    Settings.embed_model = embed_model
    Settings.llm = llm
    Settings.node_parser = SentenceSplitter(chunk_size=1024, chunk_overlap=200)
    
    print(f"Vector for document {file_url} stored in Supabase for user {user_id}.")

def query_vector_from_supabase(prompt: str, user_id: str) -> dict:
    """
    Convert a prompt into an embedding, then query the Supabase 'vectors' table
    for the most similar document(s) belonging to the given user using vector similarity search.
    Returns the stored embedding vector.
    """
    # Generate an embedding for the prompt
    embed_model = HuggingFaceEmbedding(model_name=MODEL_PATH)
    prompt_embedding = embed_model._embed([prompt])[0]
    
    # Build the SQL query using the pgvector similarity operator (<=>) and filter by user_id.
    query = f"""
    SELECT * FROM vectors
    WHERE user_id = '{user_id}'
    ORDER BY embedding <=> ARRAY{prompt_embedding}::vector
    LIMIT 1;
    """
    response = supabase.rpc("run_sql", {"query": query}).execute()
    
    if hasattr(response, 'error') and response.error:
        print("Error querying vector:", response.error)
        return {"vector": []}
    else:
        if response.data and len(response.data) > 0:
            result = response.data[0]
            stored_embedding = result.get("embedding", [])
            return {"vector": stored_embedding}
        else:
            return {"vector": []}
