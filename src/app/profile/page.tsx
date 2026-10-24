// The signed-in person's profile. Guests are sent to /login.

import type { Metadata } from "next";
import { ProfileScreen } from "@/components/profile/ProfileScreen";

export const metadata: Metadata = {
  title: "Profile · Hela-Connect",
  description: "View and edit your Hela-Connect profile.",
};

export default function ProfilePage() {
  return <ProfileScreen mode="own" />;
}
