import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-options";

// Re-export authOptions for backward compatibility
export { authOptions } from "@/lib/auth-options";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// Forzar Node.js runtime en lugar de Edge runtime
export const runtime = 'nodejs';
