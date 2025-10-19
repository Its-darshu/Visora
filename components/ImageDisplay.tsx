
import React, { useState } from 'react';

interface ImageDisplayProps {
  imageUrl: string | null;
  isLoading: boolean;
}

const SkeletonLoader: React.FC = () => (
    <div className="w-full h-full bg-slate-200 rounded-xl animate-pulse flex items-center justify-center">
      <div className="text-slate-400">
        <i className="fa-solid fa-spinner fa-spin text-2xl"></i>
        <p className="mt-2 text-sm">Generating image...</p>
      </div>
    </div>
);

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl, isLoading }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
    console.log('Image loaded successfully:', imageUrl);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageLoading(false);
    setImageError(true);
    console.error('Image failed to load:', imageUrl, e);
  };

  const getImageSource = (url: string): string => {
    // If it's already a data URL (base64), return as is
    if (url.startsWith('data:')) {
      return url;
    }
    
    // For external URLs, add proxy if needed or return as is
    return url;
  };

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
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                <div className="text-slate-400">
                  <i className="fa-solid fa-spinner fa-spin text-xl"></i>
                  <p className="mt-1 text-sm">Loading image...</p>
                </div>
              </div>
            )}
            
            {imageError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                <i className="fa-solid fa-exclamation-triangle text-3xl mb-2 text-orange-400"></i>
                <p className="text-sm text-center px-4">
                  Unable to load image<br />
                  <span className="text-xs text-slate-500">Trying alternative sources...</span>
                </p>
              </div>
            )}
            
            <img
              src={getImageSource(imageUrl)}
              alt="Generated visual for the lesson"
              className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${
                imageLoading || imageError ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ display: imageError ? 'none' : 'block' }}
            />
          </>
        )}
      </div>
      
      {imageUrl && imageError && (
        <div className="mt-2 text-xs text-slate-500">
          Image source: {imageUrl.includes('pollinations') ? 'Pollinations AI' : 
                        imageUrl.includes('unsplash') ? 'Unsplash' : 
                        imageUrl.includes('base64') ? 'Hugging Face Flux' : 'External'}
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;
