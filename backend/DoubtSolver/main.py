import os
import warnings
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from llama_index.llms.groq import Groq

# Additional imports for loading embeddings from Supabase
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core import (
    StorageContext,
    Settings,
    load_index_from_storage
)

# Import custom modules for vector creation/checking
from vector import create_vector_index_from_url, check_user_vectors, query_vector_from_supabase

# Suppress warnings and load environment variables
warnings.filterwarnings('ignore')
load_dotenv()

# Constants and configuration
MODEL_PATH = "sentence-transformers/all-mpnet-base-v2"  # Embedding model used on Supabase vectors
LLM_MODEL = "llama3-70b-8192"  # LLM model for Groq
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Initialize Supabase client
from supabase import create_client, Client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Chat history for conversation context (global, per session)
user_chat_histories = {}

# For custom settings, we add a new field to hold the embedding vector.
# This value is updated on each vector query.
class Settings:
    embed_model = None
    llm = None
    node_parser = None
    embedding_context = None

@app.route('/generate_vectors', methods=['POST'])
def generate_vectors():
    """
    Create a vector entry from a PDF file provided by its cloud URL (e.g., Supabase URL).
    This endpoint processes the file in memory and stores its vector representation in Supabase.
    Expects a JSON payload: { "file_url": "<url-of-pdf>", "user_id": "<user-id>" }.
    """
    data = request.get_json()
    if not data or "file_url" not in data or "user_id" not in data:
        return jsonify({"error": "Missing file_url or user_id in request"}), 400

    file_url = data["file_url"]
    user_id = data["user_id"]

    # Process the file directly from the cloud URL and store its vector in Supabase.
    create_vector_index_from_url(file_url, user_id)

    return jsonify({
        "status": "success",
        "message": "Vector generated successfully from the provided URL and stored in Supabase for user " + user_id
    })

@app.route('/check_vectors', methods=['POST'])
def check_vectors():
    """
    Check if a user has existing vectors stored in Supabase.
    Expects a JSON payload: { "user_id": "<user-id>" }.
    """
    data = request.get_json()
    if not data or "user_id" not in data:
        return jsonify({"error": "Missing user_id in request"}), 400

    user_id = data["user_id"]
    exists = check_user_vectors(user_id)
    return jsonify({"status": "success", "exists": exists})

@app.route('/generate_flashcards', methods=['POST'])
def generate_flashcards():
    """
    Generate flashcards based on a provided topic.
    Expects a JSON payload: { "topic": "<your_topic>", "user_id": "<user-id>" }.
    Uses the raw embedding vector stored in Supabase to update the Settings.
    """
    try:
        data = request.get_json()
        if not data or "topic" not in data or "user_id" not in data:
            return jsonify({"error": "Missing topic or user_id in request"}), 400

        topic = data["topic"]
        user_id = data["user_id"]

        # Retrieve the raw embedding vector from Supabase.
        result = query_vector_from_supabase(topic, user_id)
        retrieved_vector = result.get("vector", [])
        # Update Settings with the raw vector.
        Settings.embedding_context = retrieved_vector

        # Construct a refined prompt for the LLM.
        # Here we indicate that a custom embedding context is loaded (without sending raw numbers).
        llm_prompt = f"""
        A custom embedding context has been loaded into your settings.
        Generate exactly 10 unique flashcards on the topic "{topic}" in valid JSON format.
        Each flashcard must:
          - Cover a distinct concept or piece of information
          - Not overlap significantly with other flashcards
          - Have "front": A concise question or keyword
          - Have "back": A short, clear explanation or answer
        Return only a JSON array (no extra text), e.g.:
        [
            {{"front": "What is Newton's First Law?", "back": "An object at rest stays at rest unless acted upon by an external force."}},
            {{"front": "What is the capital of France?", "back": "Paris"}}
        ]
        """

        llm = Groq(model=LLM_MODEL, api_key=GROQ_API_KEY)
        response = llm.complete(llm_prompt)

        flashcards_text = response.text if hasattr(response, 'text') else str(response)
        try:
            flashcards = json.loads(flashcards_text)
        except json.JSONDecodeError:
            flashcards = [{"front": "No valid flashcards generated.", "back": ""}]

        return jsonify({"flashcards": flashcards})

    except Exception as e:
        app.logger.error(f"Error in generate_flashcards: {str(e)}")
        return jsonify({"error": f"Failed to generate flashcards: {str(e)}"}), 500

@app.route('/generate_mcqs', methods=['POST'])
def generate_mcqs():
    """
    Generate multiple-choice questions (MCQs) based on a provided topic.
    Expects a JSON payload: { "topic": "<your_topic>", "user_id": "<user-id>" }.
    Uses the raw embedding vector stored in Supabase to update the Settings.
    """
    try:
        data = request.get_json()
        if not data or "topic" not in data or "user_id" not in data:
            return jsonify({"error": "Missing topic or user_id in request"}), 400

        topic = data["topic"]
        user_id = data["user_id"]

        # Retrieve the raw embedding vector from Supabase.
        result = query_vector_from_supabase(topic, user_id)
        retrieved_vector = result.get("vector", [])
        Settings.embedding_context = retrieved_vector

        llm_prompt = f"""
        A custom embedding context has been loaded into your settings.
        Generate exactly 15 unique multiple-choice questions (MCQs) on the topic "{topic}".
        Each MCQ must contain exactly four fields:
          - "question": A concise question.
          - "options": An array of exactly 4 unique answer options.
          - "correct_answer": The correct answer (one of the options).
          - "explanation": A brief explanation of the correct answer.
        Return only a JSON array in the following format:
        [
            {{"question": "What is the capital of France?", "options": ["Berlin", "Madrid", "Paris", "Rome"], "correct_answer": "Paris", "explanation": "Paris is the capital of France."}},
            {{"question": "Which element has atomic number 1?", "options": ["Helium", "Oxygen", "Hydrogen", "Nitrogen"], "correct_answer": "Hydrogen", "explanation": "Hydrogen has atomic number 1."}},
            ... (12 more MCQs)
        ]
        """

        llm = Groq(model=LLM_MODEL, api_key=GROQ_API_KEY)
        response = llm.complete(llm_prompt)

        mcqs_text = response.text if hasattr(response, 'text') else str(response)
        # Remove markdown formatting if present
        mcqs_text = mcqs_text.replace("```json", "").replace("```", "").strip()
        
        import re
        json_pattern = r'\[\s*\{.*\}\s*\]'
        json_match = re.search(json_pattern, mcqs_text, re.DOTALL)
        if json_match:
            mcqs_text = json_match.group(0)
        
        app.logger.debug(f"MCQs text before parsing: {mcqs_text}")
        
        try:
            mcqs = json.loads(mcqs_text)
            valid_mcqs = []
            for mcq in mcqs:
                if (isinstance(mcq, dict) and 
                    "question" in mcq and 
                    "options" in mcq and 
                    "correct_answer" in mcq and
                    isinstance(mcq["options"], list) and
                    len(mcq["options"]) == 4 and
                    mcq["correct_answer"] in mcq["options"]):
                    valid_mcqs.append(mcq)
            if not valid_mcqs:
                raise ValueError("No valid MCQs found in the response")
            return jsonify({"mcqs": valid_mcqs})
        except json.JSONDecodeError as e:
            app.logger.error(f"JSON parsing error: {str(e)}, Response text: {mcqs_text}")
            return jsonify({"error": "Failed to parse LLM response as valid JSON", "raw_response": mcqs_text}), 500

    except Exception as e:
        app.logger.error(f"Error in generate_mcqs: {str(e)}")
        return jsonify({"error": f"Failed to generate MCQs: {str(e)}"}), 500

@app.route('/chat', methods=['POST'])
def chat():
    """
    Chat endpoint that uses the raw embedding vector stored in Supabase for context.
    Expects a JSON payload: { "message": "<user-message>", "user_id": "<user-id>" }.
    """
    try:
        data = request.get_json()
        if not data or "message" not in data or "user_id" not in data:
            return jsonify({"error": "Missing message or user_id in request"}), 400

        message = data["message"]
        user_id = data["user_id"]

        if user_id not in user_chat_histories:
            user_chat_histories[user_id] = []
        
        user_history = user_chat_histories[user_id]
        recent_history = user_history[-5:] if len(user_history) > 5 else user_history
        combined_history = "\n".join([
            f"Previous message = User: {user_msg}\nAssistant: {bot_msg}"
            for user_msg, bot_msg in recent_history
        ])

        # Retrieve the raw embedding vector from Supabase.
        result = query_vector_from_supabase(message, user_id)
        retrieved_vector = result.get("vector", [])
        Settings.embedding_context = retrieved_vector

        llm_prompt = f"""
        A custom embedding context has been loaded into your settings.
        Considering the following conversation history:
        {combined_history}
        
        Current question: {message}
        
        You are StudyBuddy chatbot Please respond in a warm, friendly manner as if you are chatting with a friend.
        Your response should be concise, empathetic, and helpful.
        """
        
        llm = Groq(model=LLM_MODEL, api_key=GROQ_API_KEY)
        response = llm.complete(llm_prompt)
        
        bot_message = response.text if hasattr(response, 'text') else str(response)
        user_chat_histories[user_id].append((message, bot_message))
        
        return jsonify({"output": bot_message})
    except Exception as e:
        app.logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({"error": f"Failed to process chat: {str(e)}"}), 500

@app.route('/save_quiz_results', methods=['POST'])
def save_quiz_results():
    """
    Save quiz results to Supabase.
    Expects a JSON payload: { "topic": "<topic>", "correctAnswers": <number>, "totalQuestions": <number>, "timeTaken": "<time>", "user_id": "<user-id>" }.
    """
    data = request.get_json()
    required_fields = ["topic", "correctAnswers", "totalQuestions", "timeTaken", "user_id"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing {field} in request"}), 400
    try:
        result = supabase.table("quiz_results").insert({
            "user_id": data["user_id"],
            "topic": data["topic"],
            "correct_answers": data["correctAnswers"],
            "total_questions": data["totalQuestions"],
            "time_taken": data["timeTaken"],
        }).execute()
        
        if result.error:
            raise Exception(result.error.message)
        
        return jsonify({"message": "Quiz results saved successfully!"})
    except Exception as e:
        app.logger.error(f"Error saving quiz results: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/list_user_uploads', methods=['POST'])
def list_user_uploads():
    """
    List all existing uploads for a user from the "file_metadata" table.
    Expects a JSON payload: { "user_id": "<user-id>" }.
    Returns a JSON array of objects: [{ "name": "...", "download_url": "..." }, ...].
    """
    data = request.get_json()
    if not data or "user_id" not in data:
        return jsonify({"error": "Missing user_id in request"}), 400

    user_id = data["user_id"]

    try:
        result = supabase.table("file_metadata").select("*").eq("user_id", user_id).execute()
        if result.data is None:
            raise Exception("No data returned from Supabase.")
        uploads = []
        for item in result.data:
            uploads.append({
                "name": item.get("file_name", "Unknown"),
                "download_url": item.get("download_url", "")
            })
        return jsonify({"status": "success", "uploads": uploads}), 200
    except Exception as e:
        app.logger.error(f"Error listing user uploads: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/delete_user_uploads', methods=['POST'])
def delete_user_uploads():
    """
    Delete an upload by its unique download_url.
    Expects a JSON payload: { "download_url": "<unique-download-url>" }.
    Deletes the file from Supabase Storage, the corresponding metadata, and vector entry.
    """
    data = request.get_json()
    if not data or "download_url" not in data:
        return jsonify({"error": "Missing download_url in request"}), 400

    download_url = data["download_url"]

    try:
        parts = download_url.split('/uploads/')
        if len(parts) < 2:
            raise Exception("Invalid download_url format.")
        relative_path = parts[1]

        storage_res = supabase.storage.from_("uploads").remove([relative_path])
        if isinstance(storage_res, list) and storage_res and storage_res[0].get("error"):
            raise Exception(f"Storage error: {storage_res[0]['error']['message']}")

        file_del_res = supabase.table("file_metadata").delete().eq("download_url", download_url).execute()
        if not file_del_res.data or len(file_del_res.data) == 0:
            return jsonify({"error": "No upload found with that download_url"}), 404

        vectors_del_res = supabase.table("vectors").delete().eq("document_id", download_url).execute()

        return jsonify({
            "status": "success",
            "message": f"Upload with download_url '{download_url}' deleted from storage, file_metadata, and vectors."
        }), 200

    except Exception as e:
        app.logger.error(f"Error deleting user upload: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000)
