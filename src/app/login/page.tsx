import { AuthGate } from "@/components/auth/AuthGate";

export default function LoginPage() {
  return <AuthGate initialView="login" />;
}
