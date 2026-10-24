import { AuthGate } from "@/components/auth/AuthGate";

export default function SignupPage() {
  return <AuthGate initialView="signup" />;
}