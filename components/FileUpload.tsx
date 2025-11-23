import React, { ChangeEvent, useState } from 'react';
import { UploadCloud, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Basic validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid Image (JPEG, PNG, WEBP) or PDF.");
      return;
    }
    setFileName(file.name);
    onFileSelect(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <label
        htmlFor="file-upload"
        className={`relative flex flex-col items-center justify-center w-full h-56 sm:h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ease-in-out active:scale-[0.99] touch-manipulation
          ${dragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          {fileName ? (
            <>
              <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600 dark:text-indigo-400 mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium break-all px-4">Selected: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{fileName}</span></p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Tap to change file</p>
            </>
          ) : (
            <>
              <UploadCloud className={`w-10 h-10 sm:w-12 sm:h-12 mb-3 ${dragActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <p className="mb-2 text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-200">
                Tap to upload or drag & drop
              </p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4">
                Bank Statements (PDF, PNG, JPG)
              </p>
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] sm:text-xs font-medium border border-indigo-100 dark:border-indigo-800">
                <AlertCircle className="w-3 h-3 mr-1" />
                Standard Bank, FDH, NBM, NBS
              </div>
            </>
          )}
        </div>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleChange}
          disabled={disabled}
          accept="image/*,application/pdf"
        />
      </label>
    </div>
  );
};