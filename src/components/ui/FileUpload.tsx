import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, AlertCircle } from 'lucide-react';

export interface UploadFileItem {
  id: string;
  file: File;
  name: string;
  size: string;
  type: 'image' | 'pdf' | 'document' | 'other';
  progress: number;
  error?: string;
  previewUrl?: string;
}

export interface FileUploadProps {
  onFilesSelected?: (files: File[]) => void;
  maxSizeMb?: number;
  acceptTypes?: string[];
  maxFiles?: number;
  label?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  maxSizeMb = 25,
  acceptTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.zip'],
  maxFiles = 5,
  label,
}) => {
  const [fileList, setFileList] = useState<UploadFileItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (rawFiles: FileList | File[]) => {
    const selected = Array.from(rawFiles).slice(0, maxFiles);
    const validItems: UploadFileItem[] = [];

    selected.forEach((f, idx) => {
      const sizeMb = f.size / (1024 * 1024);
      let fileErr: string | undefined = undefined;

      if (sizeMb > maxSizeMb) {
        fileErr = `File size exceeds ${maxSizeMb}MB limit (${sizeMb.toFixed(1)}MB)`;
      }

      const ext = f.name.split('.').pop()?.toLowerCase();
      let type: UploadFileItem['type'] = 'document';
      if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '')) type = 'image';
      else if (ext === 'pdf') type = 'pdf';

      validItems.push({
        id: `f-${Date.now()}-${idx}`,
        file: f,
        name: f.name,
        size: `${(f.size / 1024).toFixed(1)} KB`,
        type,
        progress: fileErr ? 0 : 100,
        error: fileErr,
        previewUrl: type === 'image' ? URL.createObjectURL(f) : undefined,
      });
    });

    setFileList((prev) => [...prev, ...validItems]);
    if (onFilesSelected) {
      onFilesSelected(validItems.filter((i) => !i.error).map((i) => i.file));
    }
  };

  const handleRemove = (id: string) => {
    setFileList((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="w-full space-y-2 font-sans text-xs text-left">
      {label && <label className="block font-semibold text-slate-800">{label}</label>}

      {/* DROP AREA */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed p-6 rounded-2xl text-center space-y-2 transition-all cursor-pointer ${
          isDragOver
            ? 'border-[var(--theme-primary,#2563EB)] bg-[var(--theme-primary-soft,#EFF6FF)]'
            : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-300'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept={acceptTypes.join(',')}
          onChange={(e) => e.target.files && processFiles(e.target.files)}
          className="hidden"
        />

        <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
        <div>
          <span className="font-semibold text-slate-800 text-xs block">
            Drag &amp; drop files here, or <span className="text-[var(--theme-primary,#2563EB)] underline">browse</span>
          </span>
          <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
            Supports Images, PDF, Docs up to {maxSizeMb}MB
          </span>
        </div>
      </div>

      {/* FILE PREVIEW LIST */}
      {fileList.length > 0 && (
        <div className="space-y-2 pt-1">
          {fileList.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                item.error ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {item.previewUrl ? (
                  <img src={item.previewUrl} alt="Preview" className="w-9 h-9 rounded-lg object-cover border shrink-0" />
                ) : item.type === 'pdf' ? (
                  <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                ) : (
                  <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                )}

                <div className="min-w-0">
                  <span className="font-semibold text-slate-900 block truncate">{item.name}</span>
                  {item.error ? (
                    <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {item.error}
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">{item.size}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">100% Uploaded</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
