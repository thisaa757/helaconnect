// Feed shapes shared by the API and the browser. No database import.

export type SuggestedComment = {
  id: number;
  author_name: string;
  body: string;
  created_at: string;
};

export type SuggestedReactions = {
  like: number;
  interested: number;
  mine: { like: boolean; interested: boolean };
};

export type SuggestedPost = {
  id: number;
  title: string;
  description: string;
  trade: string;
  area: string;
  timeframe: string | null;
  size_estimate: string | null;
  created_at: string;
  posted_by: string;
  comments: SuggestedComment[];
  reactions: SuggestedReactions;
};

export type SuggestedFeedResponse = {
  access: "authenticated" | "demo";
  role: "worker" | "customer" | null;
  jobs: SuggestedPost[];
  areas: string[];
  trades: string[];
  demo: boolean;
  error?: string;
};
