import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Вызов middleware для всех роутов кроме статики и api-роутов
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
