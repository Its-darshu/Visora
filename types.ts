
export interface LessonConcept {
  concept: string;
  explanation: string;
}

export interface Lesson {
  title: string;
  introduction: string;
  keyConcepts: LessonConcept[];
  summary: string;
}
