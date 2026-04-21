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
        try {
          if (!credentials?.email || !credentials?.password) return null;
          
          console.log("Attempting login for:", credentials.email);
          
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string }
          });

          if (!user) {
            console.log("User not found:", credentials.email);
            return null;
          }
          
          const passwordsMatch = await bcrypt.compare(
            credentials.password as string, 
            user.password as string
          );

          if (passwordsMatch) {
             console.log("Login successful for:", credentials.email);
             return {
               id: user.id,
               email: user.email,
               name: user.name,
               tenantId: user.tenantId,
               role: user.role
             };
          }
          
          console.log("Invalid password for:", credentials.email);
          return null;
        } catch (error) {
          console.error("AUTH_ERROR:", error);
          return null;
        }
      }
    })
  ]
});
