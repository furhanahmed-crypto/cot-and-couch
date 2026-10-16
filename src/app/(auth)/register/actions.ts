"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { ensureProfile } from "@/lib/auth/profile";
import { ROUTES } from "@/constants/routes";

export async function signUpWithEmail(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const privacy = formData.get("privacy") === "on";
  const whatsappOffers = formData.get("whatsappOffers") === "on";
  const area = String(formData.get("area") ?? "").trim();

  if (!name || name.length < 2) {
    return { error: "Please enter your name." };
  }
  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (!privacy) {
    return { error: "Please accept the privacy notice to continue." };
  }

  const { error } = await auth.signUp.email({ email, password, name });
  if (error) {
    return { error: error.message || "Could not create account." };
  }

  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return { error: "Account created — please sign in." };
  }

  await ensureProfile({
    authUserId: session.user.id,
    email: session.user.email,
    name,
    privacyConsent: true,
    whatsappOffers,
    area: area || null,
  });

  redirect(ROUTES.home);
}
