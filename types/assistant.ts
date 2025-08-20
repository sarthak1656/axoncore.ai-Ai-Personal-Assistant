export type ASSISTANT = {
  id: number;
  _id?: string; // MongoDB document ID
  name: string;
  title: string;
  image: string;
  instruction: string;
  userInstruction: string;
  sampleQuestions: string[];
  aiModelId?: string;
};
