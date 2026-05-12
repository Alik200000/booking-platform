import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const proxy = NextAuth(authConfig).auth;
export default proxy;


export const config = {
  // Вызов middleware для всех роутов кроме статики и api-роутов
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
