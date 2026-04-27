import os
import shutil
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from graph import ingestion_graph, retrieval_graph
import json
import asyncio
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Run ingestion graph
    try:
        await ingestion_graph.ainvoke({"file_path": file_path, "documents": [], "status": ""})
        return {"message": "File uploaded and indexed successfully", "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(question: str = Form(...)):
    # 1. Use the retrieval graph to get context and sources
    # Note: We can also stream the LLM response directly from the graph if structured correctly,
    # but for a standard SSE stream with LangChain, we'll do the retrieval first then stream the LLM.
    
    state = await retrieval_graph.ainvoke({"question": question, "context": "", "answer": "", "sources": []})
    context = state["context"]
    sources = state["sources"]

    async def event_generator():
        llm = ChatOpenAI(model="gpt-4o", streaming=True)
        
        # Send sources first
        yield f"data: {json.dumps({'type': 'sources', 'content': sources})}\n\n"
        
        prompt = f"""You are a helpful AI assistant. Answer the question based ONLY on the provided context.
        If you don't know the answer, say you don't know.
        
        Context: {context}
        
        Question: {question}
        
        Answer:"""
        
        async for chunk in llm.astream(prompt):
            if chunk.content:
                yield f"data: {json.dumps({'type': 'token', 'content': chunk.content})}\n\n"
        
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
