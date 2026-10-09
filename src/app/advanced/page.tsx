import { redirect } from "next/navigation";

/**
 * Legacy /advanced route redirection.
 * Replaced by the unified AI Center at /ai featuring Dual Assistants (General AI & Cybersecurity AI).
 */
export default function AdvancedPage() {
  redirect("/ai");
}
