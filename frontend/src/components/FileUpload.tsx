"use client";

import { useState } from "react";
import { Upload, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";

export default function FileUpload({ onUploadSuccess }: { onUploadSuccess: (filename: string) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".pdf")) {
      setError("Please upload a PDF file.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8000/upload", formData);
      onUploadSuccess(file.name);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className={`
        relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300
        ${isUploading ? "border-indigo-500/50 bg-indigo-500/5" : "border-white/10 hover:border-indigo-500/30 hover:bg-white/5"}
      `}>
        <input type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} accept=".pdf" />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-sm font-medium text-indigo-400">Indexing document...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white">Click to upload</p>
              <p className="text-xs text-gray-500 mt-1">PDF up to 10MB</p>
            </div>
          </div>
        )}
      </label>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
