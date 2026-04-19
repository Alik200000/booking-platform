import type { NextAuthConfig } from "next-auth";

// Эта конфигурация будет использоваться в middleware.ts (Edge Runtime совместимая)
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/admin");
      
      // Защищаем роуты админки
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect на страницу логина
      }
      return true;
    },
    jwt({ token, user }) {
      // При логине мы сохраняем tenantId и роль в JWT токен
      if (user) {
        token.id = user.id;
        token.tenantId = user.tenantId;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      // Прокидываем данные из токена в сессию клиента
      if (session.user) {
        session.user.id = token.id as string;
        session.user.tenantId = token.tenantId as string | null;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [], 
} satisfies NextAuthConfig;
