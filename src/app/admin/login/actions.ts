"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { ensureProfile, getCurrentProfile } from "@/lib/auth/profile";
import { ROUTES } from "@/constants/routes";

export async function staffSignIn(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { data, error } = await auth.signIn.email({ email, password });
  if (error) {
    return { error: error.message || "Could not sign in." };
  }

  const user =
    data?.user ?? (await auth.getSession()).data?.user ?? null;
  if (!user) {
    return { error: "Session missing after sign-in." };
  }

  await ensureProfile({
    authUserId: user.id,
    email: user.email,
    name: user.name,
  });

  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "team")) {
    await auth.signOut();
    return {
      error:
        "This account is not staff. Ask an admin to set your profile role to admin or team.",
    };
  }

  redirect(ROUTES.admin.dashboard);
}
