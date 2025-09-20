
import React from 'react';
import type { Lesson, LessonConcept } from '../types';

interface LessonDisplayProps {
  lesson: Lesson | null;
  isLoading: boolean;
}

const SkeletonLoader: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-slate-200 rounded-md w-3/4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-slate-200 rounded-md w-full"></div>
      <div className="h-4 bg-slate-200 rounded-md w-5/6"></div>
    </div>
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
                <div className="h-5 bg-slate-200 rounded-md w-1/2"></div>
                <div className="h-4 bg-slate-200 rounded-md w-full"></div>
            </div>
        ))}
    </div>
    <div className="h-4 bg-slate-200 rounded-md w-full"></div>
  </div>
);


const LessonDisplay: React.FC<LessonDisplayProps> = ({ lesson, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
        <SkeletonLoader />
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-200 transition-all duration-500">
      <h2 className="text-3xl font-bold text-slate-800 mb-4">{lesson.title}</h2>
      <p className="text-slate-600 mb-6 text-lg">{lesson.introduction}</p>

      <div className="space-y-4 mb-6">
        {lesson.keyConcepts.map((item: LessonConcept, index: number) => (
          <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-indigo-700 text-lg mb-1">{item.concept}</h3>
            <p className="text-slate-600">{item.explanation}</p>
          </div>
        ))}
      </div>
      
      <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
        <p className="font-semibold text-indigo-800 ">{lesson.summary}</p>
      </div>
    </div>
  );
};

export default LessonDisplay;
