
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
    <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 aspect-video lg:aspect-auto">
        <div className="w-full h-full relative">
            <div className="absolute inset-0 flex items-center justify-center">
                {isLoading && <SkeletonLoader />}
                {!isLoading && !imageUrl && (
                    <div className="text-center text-slate-400">
                         <i className="fa-solid fa-image text-4xl mb-2"></i>
                         <p>Visual will appear here</p>
                    </div>
                )}
            </div>
             {imageUrl && !isLoading && (
                <img
                    src={imageUrl}
                    alt="Generated visual for the lesson"
                    className="w-full h-full object-cover rounded-lg transition-opacity duration-500"
                />
            )}
        </div>
    </div>
  );
};

export default ImageDisplay;
