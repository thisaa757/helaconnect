import type { Metadata } from "next";
import { SignupForm } from "@/components/signup/SignupForm";

export const metadata: Metadata = {
  title: "Create account · Hela-Connect",
  description: "Create a Hela-Connect account as a worker or a customer in Sri Lanka.",
};

export default function SignupPage() {
  return <SignupForm />;
}
