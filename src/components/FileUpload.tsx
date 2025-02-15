import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  label: string;
  accept: Record<string, string[]>;
  preview?: string | null;
}

export function FileUpload({ onFileSelect, label, accept, preview }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        {...getRootProps()}
        className={clsx(
          "relative border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all",
          "hover:border-blue-400 hover:bg-blue-50/50",
          isDragActive ? "border-blue-500 bg-blue-50/50" : "border-gray-300"
        )}
      >
        <input {...getInputProps()} />
        {preview ? (
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-48 object-cover rounded-md"
          />
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}