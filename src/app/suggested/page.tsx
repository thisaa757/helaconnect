// Suggested jobs for workers, stored in the local SQLite database.

import { SuggestedFeed } from "@/components/suggested/SuggestedFeed";

export default function SuggestedPage() {
  return <SuggestedFeed page="suggested" />;
}
