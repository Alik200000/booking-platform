import { handlers } from "@/auth";

// Экспортируем обработчики GET и POST для API-эндпоинтов NextAuth (/api/auth/*)
export const { GET, POST } = handlers;
