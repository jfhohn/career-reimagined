import React from 'react';
import { Download, ArrowRight, RefreshCw } from 'lucide-react';
import { CareerImage } from '../types';

interface ImageGalleryProps {
  images: CareerImage[];
  onSelectCareer: (career: string) => void;
  onRetry: () => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onSelectCareer, onRetry }) => {
  const handleDownload = (e: React.MouseEvent, imageUrl: string, filename: string) => {
    e.stopPropagation(); // Prevent card click
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">Your Reimagined Futures</h2>
            <p className="mt-2 text-slate-600">Select a career to build your transition plan.</p>
        </div>
        <button 
            onClick={onRetry} 
            className="hidden sm:flex items-center gap-2 text-sm text-slate-500 hover:text-evergreen-900 transition-colors"
        >
            <RefreshCw className="w-4 h-4" />
            Start Over
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((img) => (
          <div
            key={img.id}
            onClick={() => onSelectCareer(img.career)}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl hover:border-evergreen-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            {/* Image Container */}
            <div className="aspect-[3/4] w-full bg-slate-100 relative overflow-hidden">
                {img.loading ? (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                        Loading...
                    </div>
                ) : img.error ? (
                     <div className="absolute inset-0 flex items-center justify-center text-red-400 p-4 text-center text-sm">
                        {img.error}
                    </div>
                ) : (
                    <img 
                        src={img.imageUrl} 
                        alt={img.career} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                )}
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <h3 className="text-2xl font-bold mb-1">{img.career}</h3>
                    <div className="flex items-center gap-2 text-evergreen-200 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                        View Plan <ArrowRight className="w-4 h-4" />
                    </div>
                </div>

                {/* Download Button */}
                {!img.loading && !img.error && (
                    <button
                        onClick={(e) => handleDownload(e, img.imageUrl, `reimagined-${img.career}.png`)}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors"
                        title="Download Image"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                )}
            </div>
          </div>
        ))}
      </div>
        <div className="flex justify-center sm:hidden pt-4">
             <button 
                onClick={onRetry} 
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
            >
                <RefreshCw className="w-4 h-4" />
                Try Different Photos
            </button>
        </div>
    </div>
  );
};

export default ImageGallery;
