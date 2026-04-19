import { cookies } from "next/headers";

export async function setClientSession(clientId: string, tenantId: string) {
  const cookieStore = await cookies();
  cookieStore.set(`client_session_${tenantId}`, clientId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export async function getClientSession(tenantId: string) {
  const cookieStore = await cookies();
  const session = cookieStore.get(`client_session_${tenantId}`);
  return session?.value;
}

export async function clearClientSession(tenantId: string) {
  const cookieStore = await cookies();
  cookieStore.delete(`client_session_${tenantId}`);
}
