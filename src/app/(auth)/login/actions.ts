"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { ensureProfile } from "@/lib/auth/profile";
import { ROUTES } from "@/constants/routes";

export async function signInWithEmail(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { error } = await auth.signIn.email({ email, password });
  if (error) {
    return { error: error.message || "Could not sign in. Check email and password." };
  }

  const { data: session } = await auth.getSession();
  if (session?.user) {
    await ensureProfile({
      authUserId: session.user.id,
      email: session.user.email,
      name: session.user.name,
    });
  }

  redirect(ROUTES.home);
}
