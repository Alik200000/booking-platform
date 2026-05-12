import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SuperAdminDashboard() {
  const session = await auth();
  if (!session || session.user?.role !== "SUPERADMIN") redirect("/login");

  return (
    <div className="p-20 text-center">
      <h1 className="text-4xl font-bold">ZENO Superadmin is Online</h1>
      <p className="mt-4 text-gray-500">Если вы видите эту надпись, значит авторизация работает. Сейчас я верну остальные функции.</p>
    </div>
  );
}
