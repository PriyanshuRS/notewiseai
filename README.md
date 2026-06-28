# NoteWiseAI

## Overview
NoteWiseAI is an AI powered study assistant and document analysis platform. It allows users to upload their study materials (PDFs and text files) and interact with them using natural language. NoteWiseAI provides features such as automated summarization, interactive quiz generation for self-assessment, and spaced repetition flashcards to ensure long term retention of information. It is designed to streamline the learning process by transforming passive reading into active, engaging study sessions.

## Key Features
- **Document Chat**: Upload multiple documents to a study space and interact with them seamlessly using context aware AI.
- **Automated Summarization**: Quickly generate concise summaries of complex topics from your uploaded materials.
- **AI Assessor (Quiz Generation)**: Automatically generate quizzes based on your documents to test your knowledge, complete with analytics tracking your top weaknesses and average scores.
- **Flashcard System**: Generate flashcards from your study materials and review them using an integrated spaced repetition system.
- **Multi-Model Support**: Switch between local LLMs (via Ollama) for privacy and offline usage, or cloud based models (via OpenAI) for advanced reasoning.

## Tech Stack
### Backend
- **Framework**: Django and Django REST Framework
- **Database**: PostgreSQL
- **Vector Store**: Qdrant
- **AI and NLP**: LangChain, Sentence Transformers (`all-MiniLM-L6-v2`), PyMuPDF (for document processing)
- **Package Management**: `uv`

### Frontend
- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS and Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Prerequisites
- **Python**: 3.12 or higher
- **Node.js**: v20 or higher
- **PostgreSQL**: Running locally or remotely
- **uv**: Python package installer and resolver
- **Ollama**: (Optional) If you plan to use local models.

## Installation and Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd notewiseai
```

### 2. Backend Setup
Navigate to the root directory where `pyproject.toml` is located.

```bash
# Install dependencies using uv
uv sync
# Or manually create a virtual environment and install dependencies:
# uv venv
# source .venv/bin/activate  # On Windows: .venv\Scripts\activate
# uv pip install -e .

# Configure Environment Variables
# Create a .env file in the backend directory with your database credentials:
# DB_NAME=notewiseai_db
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_HOST=localhost
# DB_PORT=5432
```

Ensure your PostgreSQL service is running and the specified database is created.

```bash
cd backend

# Run database migrations
python manage.py makemigrations
python manage.py migrate

# Start the Django development server
python manage.py runserver
```

The backend API will be available at `http://127.0.0.1:8000`.

### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory.

```bash
cd frontend

# Install Node.js dependencies
npm install

# Start the Next.js development server
npm run dev
```

The frontend application will be accessible at `http://localhost:3000`.

## Usage Configuration
- **AI Providers**: You can configure your AI provider directly from the frontend UI via the settings modal. You can choose between a local Ollama instance (which communicates with `http://localhost:11434` by default) or provide an OpenAI API key.
- **Vector Database**: Qdrant is configured to run locally via the Python client. A `qdrant_db` folder will be automatically generated in the backend directory to persistently store your document embeddings.
