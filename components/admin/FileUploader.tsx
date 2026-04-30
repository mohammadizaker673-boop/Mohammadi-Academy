import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, File, Image, Video, FileText, Music } from 'lucide-react';
import { uploadFileWithValidation, FileType, UploadProgress, getFileSizeFromUrl } from '../../services/storageService';
import { auth } from '../../services/firebase';

interface FileUploaderProps {
  fileType: FileType;
  folder: string;
  onUploadComplete: (url: string) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  maxFiles?: number;
  existingFiles?: string[];
}

export default function FileUploader({
  fileType,
  folder,
  onUploadComplete,
  onUploadError,
  accept,
  maxFiles = 1,
  existingFiles = []
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; name: string }[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files) as File[];
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    if (!auth.currentUser) {
      const error = 'You must be logged in to upload files.';
      setErrors([error]);
      if (onUploadError) onUploadError(error);
      return;
    }
    const totalFiles = uploadedFiles.length + existingFiles.length + files.length;
    
    if (totalFiles > maxFiles) {
      const error = `Maximum ${maxFiles} file(s) allowed`;
      setErrors([error]);
      if (onUploadError) onUploadError(error);
      return;
    }

    setErrors([]);
    
    for (const file of files) {
      const fileIndex = uploadProgress.length;
      
      setUploadProgress(prev => [...prev, { progress: 0, status: 'uploading' }]);

      try {
        const url = await uploadFileWithValidation(
          file,
          fileType,
          folder,
          (progress) => {
            setUploadProgress(prev => {
              const newProgress = [...prev];
              newProgress[fileIndex] = progress;
              return newProgress;
            });
          }
        );

        setUploadedFiles(prev => [...prev, { url, name: file.name }]);
        onUploadComplete(url);
      } catch (error: any) {
        const errorMsg = error.message || 'Upload failed';
        setErrors(prev => [...prev, `${file.name}: ${errorMsg}`]);
        if (onUploadError) onUploadError(errorMsg);
        
        setUploadProgress(prev => {
          const newProgress = [...prev];
          newProgress[fileIndex] = { progress: 0, status: 'error', error: errorMsg };
          return newProgress;
        });
      }
    }
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = () => {
    switch (fileType) {
      case 'image':
        return <Image className="w-8 h-8" />;
      case 'video':
        return <Video className="w-8 h-8" />;
      case 'pdf':
      case 'document':
        return <FileText className="w-8 h-8" />;
      case 'audio':
        return <Music className="w-8 h-8" />;
      default:
        return <File className="w-8 h-8" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${isDragging 
            ? 'border-primary-500 bg-sky-50' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={accept}
          multiple={maxFiles > 1}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 bg-sky-100 rounded-full text-primary-600">
            {getFileIcon()}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">
              Drop {fileType} files here or click to browse
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Maximum {maxFiles} file(s) • {fileType === 'image' ? '10MB' : fileType === 'video' ? '500MB' : fileType === 'pdf' ? '50MB' : fileType === 'audio' ? '100MB' : '50MB'} per file
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="space-y-2">
          {uploadProgress.map((progress, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {progress.status === 'uploading' && 'Uploading...'}
                  {progress.status === 'completed' && 'Upload complete'}
                  {progress.status === 'error' && 'Upload failed'}
                </span>
                {progress.status === 'uploading' && (
                  <span className="text-sm text-gray-500">{Math.round(progress.progress)}%</span>
                )}
                {progress.status === 'completed' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {progress.status === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              {progress.status === 'uploading' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              )}
              {progress.status === 'error' && progress.error && (
                <p className="text-xs text-red-600 mt-1">{progress.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Uploaded Files</h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-600 hover:underline"
                  >
                    View file
                  </a>
                </div>
              </div>
              <button
                onClick={() => removeUploadedFile(index)}
                className="p-1 text-red-500 hover:bg-red-100 rounded transition"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
