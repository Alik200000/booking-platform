import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tenantId: string | null;
      role: string;
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    tenantId: string | null;
    role: string;
    email: string | null;
    phoneNumber?: string | null;
  }
}
