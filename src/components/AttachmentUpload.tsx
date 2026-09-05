'use client';

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { UploadCloud, X, FileText, Image as ImageIcon } from 'lucide-react';

interface AttachmentUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeBytes?: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function AttachmentUpload({
  files,
  onChange,
  maxFiles = 5,
  maxSizeBytes = 5 * 1024 * 1024, // 5MB
}: AttachmentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    setError(null);

    const validFiles: File[] = [];
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      if (file.size > maxSizeBytes) {
        setError(`"${file.name}" exceeds the 5MB size limit.`);
        continue;
      }
      validFiles.push(file);
    }

    const combined = [...files, ...validFiles].slice(0, maxFiles);
    onChange(combined);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-slate-900 bg-slate-100/60'
            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)}
          accept="image/*,application/pdf,text/plain"
        />

        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-600 border border-slate-200">
          <UploadCloud className="w-4 h-4" />
        </div>

        <p className="text-xs font-medium text-slate-800">
          Drag and drop files here, or <span className="text-slate-900 font-semibold underline underline-offset-2">browse</span>
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          PNG, JPG, WEBP, PDF, TXT up to 5MB (max {maxFiles} files)
        </p>
      </div>

      {error && (
        <p className="text-xs text-rose-600 font-medium">
          {error}
        </p>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, idx) => {
            const isImage = file.type.startsWith('image/');
            return (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs"
              >
                <div className="flex items-center gap-2.5 truncate">
                  {isImage ? (
                    <ImageIcon className="w-4 h-4 text-slate-600 shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="font-medium text-slate-800 truncate">
                    {file.name}
                  </span>
                  <span className="text-slate-400 text-[11px] shrink-0">
                    ({formatBytes(file.size)})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                  title="Remove file"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
