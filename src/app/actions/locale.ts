"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function toggleLocale() {
  const cookieStore = await cookies();
  const current = cookieStore.get("NEXT_LOCALE")?.value || "ru";
  cookieStore.set("NEXT_LOCALE", current === "ru" ? "kz" : "ru", { path: "/" });
  revalidatePath("/", "layout");
}
