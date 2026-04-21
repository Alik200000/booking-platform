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
          
          const email = credentials.email as string;
          const password = credentials.password as string;

          // MASTER ACCOUNT BOOTSTRAPPING (GOD MODE LOGIN)
          if (email === "admin@salonix.kz" && password === "admin123") {
             console.log("Master account access attempt...");
             
             // Ensure tenant exists
             let tenant = await prisma.tenant.findFirst();
             if (!tenant) {
               tenant = await prisma.tenant.create({ data: { name: "Salonix", slug: "salonix" } });
             }

             const hashedPassword = await bcrypt.hash(password, 10);
             const masterUser = await prisma.user.upsert({
                where: { email },
                update: { password: hashedPassword, role: "SUPERADMIN" },
                create: { email, name: "Master Admin", password: hashedPassword, role: "SUPERADMIN", tenantId: tenant.id }
             });

             return {
                id: masterUser.id,
                email: masterUser.email,
                name: masterUser.name,
                tenantId: masterUser.tenantId,
                role: masterUser.role
             };
          }
          
          console.log("Attempting login for:", email);
          
          const user = await prisma.user.findUnique({
            where: { email }
          });

          if (!user) {
            console.log("User not found:", email);
            return null;
          }
          
          const passwordsMatch = await bcrypt.compare(
            password, 
            user.password as string
          );

          if (passwordsMatch) {
             console.log("Login successful for:", email);
             return {
               id: user.id,
               email: user.email,
               name: user.name,
               tenantId: user.tenantId,
               role: user.role
             };
          }
          
          console.log("Invalid password for:", email);
          return null;
        } catch (error) {
          console.error("AUTH_ERROR:", error);
          return null;
        }
      }
    })
  ]
});
