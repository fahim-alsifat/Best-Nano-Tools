
import React, { useState, useRef, useCallback } from 'react';
import { UploadIcon } from './Icons';

interface ImageUploaderProps {
  title: string;
  onFileSelect: (file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ title, onFileSelect }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
      setFileName(file.name);
      onFileSelect(file);
    }
  }, [onFileSelect, previewUrl]);

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
     if (file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
      setFileName(file.name);
      onFileSelect(file);
    }
  };


  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-slate-700 mb-2 text-center">{title}</h3>
      <div
        className="relative w-full aspect-square bg-white/60 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
        onClick={handleAreaClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center p-1 rounded-b-xl truncate">
              {fileName}
            </div>
          </>
        ) : (
          <div className="text-center p-4">
            <UploadIcon />
            <p className="mt-2 font-semibold">Click to upload or drag & drop</p>
            <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP</p>
          </div>
        )}
      </div>
    </div>
  );
};
