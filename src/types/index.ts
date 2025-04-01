export interface NewsItem {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  authorId: string;
}

export type User = string | null;
