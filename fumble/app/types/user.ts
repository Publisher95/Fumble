export interface UserProfile {
  id: number;
  accessCode: string;
  name: string;
  mainPhoto: string;
  tags: string[];
  age: number;
  height: string;
  stereotype?: string;
  profession: string;
  location: string;
  photos: string[];
  prompts: { question: string; answer: string }[];
}
