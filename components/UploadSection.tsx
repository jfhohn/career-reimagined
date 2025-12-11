import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface UploadSectionProps {
  onImageSelected: (file: File) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onImageSelected }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndProcessFile = (file: File) => {
    // Valid types: jpeg, png, webp
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError("Please upload a valid image (JPEG, PNG, WEBP).");
      return;
    }
    // Max size 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError("File size too large. Please upload an image under 5MB.");
      return;
    }
    setError(null);
    onImageSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={`relative flex flex-col items-center justify-center w-full h-80 p-6 transition-all border-2 border-dashed rounded-2xl cursor-pointer
        ${dragActive ? 'border-evergreen-500 bg-evergreen-50' : 'border-slate-300 bg-white hover:bg-evergreen-50 hover:border-evergreen-400'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/jpeg, image/png, image/webp"
          onChange={handleChange}
        />
        
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className={`p-4 rounded-full ${dragActive ? 'bg-evergreen-100' : 'bg-slate-100'}`}>
            <Upload className={`w-10 h-10 ${dragActive ? 'text-evergreen-900' : 'text-slate-500'}`} />
          </div>
          <div>
            <p className="text-xl font-semibold text-slate-700">
              Upload a photo
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Drag & drop or click to select a headshot of you or your pet.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <ImageIcon className="w-4 h-4" />
            <span>JPG, PNG, WEBP up to 5MB</span>
          </div>
        </div>

        {error && (
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center p-3 space-x-2 text-sm text-red-600 bg-red-50 rounded-lg animate-fade-in">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadSection;
