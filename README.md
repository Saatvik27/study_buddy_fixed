# StudyBuddy - AI-Powered Learning Assistant

StudyBuddy is an AI-powered learning assistant platform that helps students study more effectively by providing tools for document management, flashcard generation, MCQs, personalized AI chat support and more.

## Features

- **Document Management**: Upload, manage and delete study materials
- **AI Chatbot**: Ask questions about your uploaded documents and get intelligent answers
- **Flashcard Generation**: Automatically create study flashcards from your documents
- **MCQ Generation**: Generate practice multiple-choice questions based on your study material
- **User Authentication**: Secure login/signup with email or Google authentication
- **Personalized Learning**: AI-powered responses tailored to your study materials
- **Responsive Design**: Works smoothly on desktop and mobile devices

## Tech Stack

### Frontend
- React.js with Vite for fast development
- Tailwind CSS for styling
- Firebase Authentication for user management
- Context API for state management
- React Router for navigation

### Backend
- Flask API with Python
- Vector embedding for document processing and search
- LLM integration via Groq API 
- Firebase for user data and chat history storage
- Supabase for document storage and vector embeddings

## Getting Started

### Prerequisites
- Node.js (v16 or later)
- Python 3.9+ 
- Firebase account
- Supabase account
- Groq API key

### Installation

#### Frontend Setup
1. Clone the repository
2. Navigate to the project directory
```bash
cd study_buddy_fixed/frontend
```
3. Install dependencies
```bash
npm install
```
4. Create a `.env` file in the frontend directory with your Firebase and Supabase config:
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_anon_key
```
5. Start the development server
```bash
npm run dev
```

#### Backend Setup
1. Navigate to the backend directory
```bash
cd ../backend
```
2. Create a virtual environment (recommended)
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```
3. Install dependencies
```bash
pip install -r DoubtSolver/requirements.txt
```
4. Create a `.env` file in the backend directory with your credentials:
```
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
PORT=8000
```
5. Start the Flask server
```bash
python -m DoubtSolver.main
```

### Deployment
- Frontend is deployed on Firebase Hosting
- Backend is deployed on Render

## Usage

1. Sign up or login to your StudyBuddy account
2. Upload your study materials (PDFs, documents)
3. Navigate to the Flashcards section to generate study flashcards
4. Try the MCQs section for practice questions based on your materials
5. Use the AI chatbot to ask questions about your uploaded documents
6. View or delete your uploaded files in the document management section

## Project Structure

```
/frontend             # React frontend application
  /src                # Source files
    /components       # React components
    /contexts         # React context providers
    /firebase         # Firebase configuration
    /supabase         # Supabase client configuration
/backend              # Flask backend server
  /DoubtSolver        # Main application module
    /vector.py        # Vector embedding operations
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## Acknowledgements

- Firebase for authentication and storage
- Supabase for document storage and vector embeddings  
- Groq for LLM API access
- Flask for the backend framework
- React and Vite for the frontend framework
- Tailwind CSS for the UI design
