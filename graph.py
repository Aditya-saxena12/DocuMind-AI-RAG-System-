import os
from typing import List, Dict, Any, TypedDict
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langgraph.graph import StateGraph, END
from dotenv import load_dotenv

load_dotenv()

# Pinecone setup
pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
index_name = os.environ.get("PINECONE_INDEX_NAME")

embeddings = OpenAIEmbeddings()

# Define States
class IngestionState(TypedDict):
    file_path: str
    documents: List[Any]
    status: str

class RetrievalState(TypedDict):
    question: str
    context: str
    answer: str
    sources: List[str]

# --- Ingestion Graph ---

def load_pdf(state: IngestionState):
    loader = PyPDFLoader(state["file_path"])
    docs = loader.load()
    return {"documents": docs}

def split_documents(state: IngestionState):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    split_docs = text_splitter.split_documents(state["documents"])
    return {"documents": split_docs}

def ingest_to_pinecone(state: IngestionState):
    PineconeVectorStore.from_documents(
        state["documents"],
        embeddings,
        index_name=index_name
    )
    return {"status": "completed"}

ingestion_builder = StateGraph(IngestionState)
ingestion_builder.add_node("load_pdf", load_pdf)
ingestion_builder.add_node("split_documents", split_documents)
ingestion_builder.add_node("ingest_to_pinecone", ingest_to_pinecone)

ingestion_builder.set_entry_point("load_pdf")
ingestion_builder.add_edge("load_pdf", "split_documents")
ingestion_builder.add_edge("split_documents", "ingest_to_pinecone")
ingestion_builder.add_edge("ingest_to_pinecone", END)

ingestion_graph = ingestion_builder.compile()

# --- Retrieval Graph ---

def retrieve_documents(state: RetrievalState):
    vector_store = PineconeVectorStore(
        index_name=index_name,
        embedding=embeddings
    )
    docs = vector_store.similarity_search(state["question"], k=4)
    context = "\n\n".join([doc.page_content for doc in docs])
    sources = [doc.metadata.get("source", "Unknown") for doc in docs]
    return {"context": context, "sources": list(set(sources))}

def generate_answer(state: RetrievalState):
    llm = ChatOpenAI(model="gpt-4o", streaming=True)
    prompt = f"""You are a helpful AI assistant. Answer the question based ONLY on the provided context.
    If you don't know the answer, say you don't know.
    
    Context: {state['context']}
    
    Question: {state['question']}
    
    Answer:"""
    
    # In a real LangGraph with streaming, we'd handle the stream differently, 
    # but for simplicity in the graph state, we'll store the final answer here 
    # or handle streaming in the FastAPI endpoint by calling the LLM directly 
    # while using the graph for retrieval.
    # However, to follow the "Retrieval Graph" requirement:
    
    response = llm.invoke(prompt)
    return {"answer": response.content}

retrieval_builder = StateGraph(RetrievalState)
retrieval_builder.add_node("retrieve", retrieve_documents)
retrieval_builder.add_node("generate", generate_answer)

retrieval_builder.set_entry_point("retrieve")
retrieval_builder.add_edge("retrieve", "generate")
retrieval_builder.add_edge("generate", END)

retrieval_graph = retrieval_builder.compile()
