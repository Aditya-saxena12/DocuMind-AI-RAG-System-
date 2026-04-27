"use client";

import { useState } from "react";
import Chat from "@/components/Chat";
import FileUpload from "@/components/FileUpload";
import { FileText, MessageSquare, Shield, Zap } from "lucide-react";

export default function Home() {
  const [activeFile, setActiveFile] = useState<string | null>(null);

  return (
    <main className="flex flex-col h-screen max-h-screen overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 glass-border border-b bg-black/20 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="text-white w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl font-bold font-heading bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            DocuMind AI
          </h1>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-gray-400">
          <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
            <Shield className="w-4 h-4" />
            <span>Secure</span>
          </div>
          <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-white">
            OpenAI GPT-4o
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar / Upload Section */}
        <aside className="w-80 glass-border border-r bg-black/10 flex flex-col p-6 gap-6 overflow-y-auto">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Knowledge Base
            </h2>
            <FileUpload onUploadSuccess={(filename) => setActiveFile(filename)} />
          </div>

          <div className="flex-1">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Recent Documents
            </h2>
            {activeFile ? (
              <div className="flex items-center gap-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl animate-fade-in">
                <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="text-indigo-400 w-5 h-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">{activeFile}</p>
                  <p className="text-xs text-indigo-400/70">Indexed & Ready</p>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 border-2 border-dashed border-white/5 rounded-2xl">
                <p className="text-sm text-gray-500">No documents uploaded yet</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-2xl">
            <p className="text-xs font-medium text-indigo-300 mb-1">PRO TIP</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Upload multiple PDFs to build a comprehensive knowledge base for your AI assistant.
            </p>
          </div>
        </aside>

        {/* Main Chat Area */}
        <section className="flex-1 flex flex-col relative bg-[url('/grid.svg')] bg-center bg-fixed">
          {activeFile ? (
            <Chat />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/10 shadow-2xl">
                <MessageSquare className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-3xl font-bold font-heading mb-4">Select a document to begin</h2>
              <p className="text-gray-400 text-lg">
                Once you upload and index a PDF, you can ask questions, summarize content, and extract key insights instantly.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
