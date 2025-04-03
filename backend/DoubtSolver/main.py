import os
import warnings
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from llama_index.llms.groq import Groq
import json
import firebase_admin
from firebase_admin import credentials, firestore
from firebase_admin import firestore

# Import custom modules
from vector import create_vector_index_from_url, query_vector_from_supabase, check_user_vectors

# Import supabase client
from supabase import create_client, Client

# Suppress warnings and load environment variables
warnings.filterwarnings('ignore')
load_dotenv()

firebase_creds_path = "studybuddy-681c2-firebase-adminsdk-fbsvc-d5c7bd9100.json"
if not firebase_admin._apps:
    cred = credentials.Certificate(firebase_creds_path)
    firebase_admin.initialize_app(cred)
db = firestore.client()

MODEL_PATH = "sentence-transformers/all-mpnet-base-v2"  # Embedding model used on Supabase vectors

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Chat history for conversation context (global, per session)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MAX_CHARACTERS=2000
max_chats=10

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
    """
    try:
        data = request.get_json()
        if not data or "topic" not in data or "user_id" not in data:
            return jsonify({"error": "Missing topic or user_id in request"}), 400

        topic = data["topic"]
        user_id = data["user_id"]

        # Query Supabase for relevant content
        vector_result = query_vector_from_supabase(topic, user_id)
        relevant_content = vector_result.get("output", "")

        # Construct a refined prompt for LLM
        llm_prompt = f"""
        Based on the following information from the document:
        {relevant_content}
        
        Generate exactly 10 unique flashcards on the topic "{topic}" in **valid JSON format**.
        
        Each flashcard must:
        - Cover a distinct concept or piece of information
        - Not overlap significantly with other flashcards
        - Have "front": A concise question or keyword
        - Have "back": A short, clear explanation or answer
        
        Before finalizing, verify that each flashcard addresses a different aspect of the topic.
        
        Strictly return only a JSON array, like this:
        
        [
            {{"front": "What is Newton's First Law?", "back": "An object at rest stays at rest unless acted upon by an external force."}},
            {{"front": "What is the capital of France?", "back": "Paris"}}
        ]
        
        DO NOT include any extra text or explanations. Return **only JSON**.
        """

        # Send prompt to Groq LLM
        llm = Groq(model="llama3-70b-8192", api_key=GROQ_API_KEY)
        response = llm.complete(llm_prompt)

        # Extract and parse flashcards
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
    """
    try:
        data = request.get_json()
        if not data or "topic" not in data or "user_id" not in data:
            return jsonify({"error": "Missing topic or user_id in request"}), 400

        topic = data["topic"]
        user_id = data["user_id"]
        
        # Query Supabase for relevant content
        vector_result = query_vector_from_supabase(topic, user_id)
        relevant_content = vector_result.get("output", "")

        # Construct refined prompt for LLM
        llm_prompt = f"""
        Based on the following information from the document:
        {relevant_content}

        Generate exactly 15 unique multiple-choice questions (MCQs) on the topic "{topic}".
        Each MCQ must:
        - Cover a distinct concept or fact from the document
        - Not overlap significantly with other questions
        - Test different aspects of the topic
        
        Each MCQ must contain exactly four fields:
        - "question": A concise question.
        - "options": An array of exactly 4 unique answer options.
        - "correct_answer": The correct answer, which must be one of the 4 options.
        - "explanation": A brief explanation of the correct answer.

        Before finalizing, verify that each question addresses a different aspect of the topic and tests unique knowledge.

        Your response must be a valid JSON array and nothing else. Do not include any explanations, markdown formatting, or code blocks. Return the raw JSON array only.
        
        Here's the exact format:
        [
          {{"question": "What is the capital of France?", "options": ["Berlin", "Madrid", "Paris", "Rome"], "correct_answer": "Paris", "explanation": "Paris is the capital of France."}},
          {{"question": "Which element has the atomic number 1?", "options": ["Helium", "Oxygen", "Hydrogen", "Nitrogen"], "correct_answer": "Hydrogen", "explanation": "Hydrogen has atomic number 1."}},
          ... (12 more MCQs)
        ]
        """

        # Send prompt to Groq LLM
        llm = Groq(model="llama3-70b-8192", api_key=GROQ_API_KEY)
        response = llm.complete(llm_prompt)
        
        # Extract text from response
        mcqs_text = response.text if hasattr(response, 'text') else str(response)
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
            return jsonify({"error": "Failed to parse LLM response as valid JSON", 
                           "raw_response": mcqs_text}), 500
    
    except Exception as e:
        app.logger.error(f"Error in generate_mcqs: {str(e)}")
        return jsonify({"error": f"Failed to generate MCQs: {str(e)}"}), 500



@app.route('/get_chats', methods=['POST'])
def get_chats():
    try:
        data = request.get_json()
        if not data or "user_id" not in data:
            return jsonify({"error": "Missing user_id"}), 400

        user_id = data["user_id"]
        chats_ref = db.collection("chats")
        query = chats_ref.where("user_id", "==", user_id) \
                         .order_by("timestamp", direction=firestore.Query.DESCENDING) \
                         .limit(5)
        results = query.get()

        latest_chats = [doc.to_dict() for doc in results]
        latest_chats.reverse()

        return jsonify({"chats": latest_chats})
    
    except Exception as e:
        app.logger.error(f"Error fetching chats: {str(e)}")
        return jsonify({"error": f"Failed to retrieve chats: {str(e)}"}), 500


@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        if not data or "message" not in data or "user_id" not in data:
            return jsonify({"error": "Missing message or user_id in request"}), 400

        message = data["message"]
        user_id = data["user_id"]
        
        vector_result = query_vector_from_supabase(message, user_id)
        relevant_content = vector_result.get("output", "No relevant information found.")

        # Fetch latest chat history
        chat_history_response = get_chats()
        latest_chats_data = chat_history_response.get_json()
        latest_chats = latest_chats_data.get("chats", [])

        # Format chat history for prompt
        combined_history = "\n".join(
            f"User: {chat['prompt']}\nAssistant: {chat['response']}"
            for chat in latest_chats
        )

        # Ensure chat history doesn't exceed limit
        if len(combined_history) > MAX_CHARACTERS:
            combined_history = combined_history[-MAX_CHARACTERS:]

        llm_prompt = f"""
        You are StudyBuddy chatbot
        Based on the following information from the document:
        {relevant_content}
        
        And considering this conversation history:
        {combined_history}
        
        Current question: {message}
        
        Please respond in a warm, friendly manner as if you are chatting with a friend. Your response should:
        - Address the question directly using relevant document information
        - Use a conversational, natural tone
        - Show empathy and understanding
        - Include light acknowledgments of the user's question
        - Avoid overly formal or technical language unless necessary
        - Keep responses concise but complete
        - Occasionally use gentle conversational elements 
        - End with a friendly follow-up question when appropriate
        
        Balance being informative with being personable.
        """
        
        llm = Groq(model="llama3-70b-8192", api_key=GROQ_API_KEY)
        response = llm.complete(llm_prompt)
        
        bot_message = response.text if hasattr(response, 'text') else str(response)

        # Add chat to Firestore
        chat_data = {
            "timestamp": firestore.SERVER_TIMESTAMP,
            "user_id": user_id,
            "prompt": message,
            "response": bot_message
        }

        db.collection("chats").add(chat_data)

        try:
                chats_ref = db.collection("chats")
                query = chats_ref.where("user_id", "==", user_id) \
                                 .order_by("timestamp", direction=firestore.Query.DESCENDING)
                results = query.get()

                if len(results) > max_chats:
                    # Get chats that need to be deleted (oldest ones)
                    chats_to_delete = results[max_chats:]  # Keep only latest 10, delete the rest

                    for chat in chats_to_delete:
                        chat.reference.delete()  # Delete chat from Firestore

                    print(f"Deleted {len(chats_to_delete)} old chats for user {user_id}")

        except Exception as e:
            print(f"Error enforcing chat limit: {str(e)}")

        return jsonify({"output": bot_message})
    
    except Exception as e:
        app.logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({"error": f"Failed to process chat: {str(e)}"}), 500


# New route for saving quiz results

@app.route('/save_quiz_results', methods=['POST'])
def save_quiz_results():
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
        # Query the "file_metadata" table. Adjust these names as needed.
        result = supabase.table("file_metadata").select("*").eq("user_id", user_id).execute()

        # Check if data was returned
        if result.data is None:
            raise Exception("No data returned from Supabase.")

        uploads_data = result.data
        uploads = []
        for item in uploads_data:
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
    - Uses the full download_url to locate the row in file_metadata.
    - Extracts the relative file path from download_url to delete the file from Supabase Storage.
    - Deletes the row in vectors where document_id equals download_url.
    
    Expects a JSON payload: { "download_url": "<unique-download-url>" }.
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

        # Delete the file from Supabase Storage (bucket "uploads")
        storage_res = supabase.storage.from_("uploads").remove([relative_path])

        if isinstance(storage_res, list) and storage_res and storage_res[0].get("error"):
            raise Exception(f"Storage error: {storage_res[0]['error']['message']}")

        # Delete the row from file_metadata where download_url matches
        file_del_res = supabase.table("file_metadata").delete().eq("download_url", download_url).execute()
        if not file_del_res.data or len(file_del_res.data) == 0:
            return jsonify({"error": "No upload found with that download_url"}), 404

        # Delete from vectors where document_id equals download_url
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
