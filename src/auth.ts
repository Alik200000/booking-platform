import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user) return null;
        
        const passwordsMatch = await bcrypt.compare(
          credentials.password as string, 
          user.password
        );

        if (passwordsMatch) {
           return {
             id: user.id,
             email: user.email,
             name: user.name,
             tenantId: user.tenantId,
             role: user.role
           };
        }
        
        return null;
      }
    })
  ]
});
