
import React from 'react';

interface ImageDisplayProps {
  imageUrl: string | null;
  isLoading: boolean;
}

const SkeletonLoader: React.FC = () => (
    <div className="w-full h-full bg-slate-200 rounded-xl animate-pulse"></div>
);

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl, isLoading }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Visual Learning Aid</h3>
      <div className="w-full aspect-video relative bg-slate-50 rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <SkeletonLoader />
          </div>
        )}
        {!isLoading && !imageUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <i className="fa-solid fa-image text-4xl mb-2"></i>
            <p>Visual will appear here</p>
          </div>
        )}
        {imageUrl && !isLoading && (
          <img
            src={imageUrl}
            alt="Generated visual for the lesson"
            className="w-full h-full object-cover rounded-lg"
            onLoad={() => console.log('Image loaded successfully:', imageUrl)}
            onError={(e) => console.error('Image failed to load:', imageUrl, e)}
          />
        )}
      </div>
    </div>
  );
};

export default ImageDisplay;
