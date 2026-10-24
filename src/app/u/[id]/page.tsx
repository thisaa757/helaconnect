// Read-only public profile. The id is the person's auth user id.

import type { Metadata } from "next";
import { ProfileScreen } from "@/components/profile/ProfileScreen";

export const metadata: Metadata = {
  title: "Profile · Hela-Connect",
  description: "A public Hela-Connect profile.",
};

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProfileScreen mode="public" userId={id} />;
}
