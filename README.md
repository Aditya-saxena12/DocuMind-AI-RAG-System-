# DocuMind AI - RAG Chatbot

DocuMind AI is a premium, high-performance Document Search application built using the RAG (Retrieval-Augmented Generation) architecture. It allows users to upload PDF documents, index them into a vector database, and engage in a real-time, context-aware conversation with an AI assistant.

![Premium UI](https://img.shields.io/badge/UI-Premium_Glassmorphism-blueviolet)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js_%7C_FastAPI_%7C_LangGraph-blue)

## 🚀 Features

- **Multi-Phase LangGraph Backend**:
  - **Ingestion Graph**: Handles PDF extraction, text splitting, and vector embedding.
  - **Retrieval Graph**: Performs semantic search to find the most relevant context for your questions.
- **Real-time Streaming**: Utilizes Server-Sent Events (SSE) for a smooth, token-by-token chat experience.
- **Source Attribution**: Transparently displays which sections of your documents were used to generate the answer.
- **Premium Design**: Sleek dark mode interface with glassmorphism, smooth animations, and responsive layout.
- **Scalable Vector Search**: Powered by Pinecone Serverless.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion, Lucide React.
- **Backend**: FastAPI, LangChain, LangGraph.
- **AI Model**: OpenAI GPT-4o & text-embedding-3-small.
- **Vector DB**: Pinecone.

## 📋 Prerequisites

- **Node.js**: v18.18.0 or higher.
- **Python**: 3.9 or higher.
- **OpenAI API Key**: Required for embeddings and chat.
- **Pinecone API Key**: Required for vector storage.

## ⚙️ Setup Instructions

### 1. Backend Configuration
1. Navigate to the `backend` directory.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file based on `.env.example` and add your keys.

### 2. Frontend Configuration
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```

## 🏃 Running the Project

### Start the Backend
```bash
cd backend
python main.py
```
The server will start at `http://localhost:8000`.

### Start the Frontend
```bash
cd frontend
npm run dev
```
The application will be available at `http://localhost:3000`.

## 📂 Project Structure

```text
ai-doc-search/
├── backend/
│   ├── graph.py       # LangGraph state machine logic
│   ├── main.py        # FastAPI routes and SSE streaming
│   └── uploads/       # Temporary storage for uploaded PDFs
└── frontend/
    ├── src/app/       # Next.js App Router pages
    └── src/components/# UI Components (Chat, FileUpload)
```

## 🛡️ License
MIT
