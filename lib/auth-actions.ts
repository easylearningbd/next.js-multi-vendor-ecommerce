"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";
import { homePathForRole } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  customerRegisterSchema,
  loginSchema,
  updateProfileSchema,
  vendorRegisterSchema,
} from "@/lib/validation";

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

/** Take zod's { field: string[] } and keep just the first message per field. */
function firstErrors(fieldErrors: Record<string, string[] | undefined>) {
  const out: Record<string, string> = {};
  for (const [key, msgs] of Object.entries(fieldErrors)) {
    if (msgs && msgs.length) out[key] = msgs[0];
  }
  return out;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "store";
}

async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base);
  let slug = root;
  let n = 1;
  // Bounded loop; collisions are rare so this resolves quickly.
  while (await prisma.vendor.findUnique({ where: { slug } })) {
    slug = `${root}-${n++}`;
  }
  return slug;
}

// ─────────────────────────────────────────────────────────────
// Customer registration
// ─────────────────────────────────────────────────────────────
export async function registerCustomer(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const parsed = customerRegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: firstErrors(parsed.error.flatten().fieldErrors) };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { fieldErrors: { email: "An account with this email already exists" } };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await prisma.user.create({
      data: { name, email, passwordHash, role: "CUSTOMER" },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { fieldErrors: { email: "An account with this email already exists" } };
    }
    return { error: "Something went wrong. Please try again." };
  }

  await signInOrThrow(email, password);
  redirect("/dashboard");
}

// ─────────────────────────────────────────────────────────────
// Vendor registration (User + Vendor in one transaction)
// ─────────────────────────────────────────────────────────────
export async function registerVendor(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const parsed = vendorRegisterSchema.safeParse({
    storeName: formData.get("storeName"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { fieldErrors: firstErrors(parsed.error.flatten().fieldErrors) };
  }

  const { storeName, name, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { fieldErrors: { email: "An account with this email already exists" } };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const slug = await uniqueSlug(storeName);

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          phone: phone ? phone : null,
          role: "VENDOR",
        },
      });
      await tx.vendor.create({
        data: {
          userId: user.id,
          storeName,
          slug,
          status: "PENDING",
        },
      });
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { fieldErrors: { email: "An account with this email already exists" } };
    }
    return { error: "Something went wrong. Please try again." };
  }

  await signInOrThrow(email, password);
  redirect("/vendor/pending");
}

// ─────────────────────────────────────────────────────────────
// Login (shared by customer / vendor / admin forms)
// ─────────────────────────────────────────────────────────────
export async function login(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: firstErrors(parsed.error.flatten().fieldErrors) };
  }

  const { email, password } = parsed.data;

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (e) {
    if (e instanceof AuthError) {
      // Single generic message — never reveal whether the email exists.
      return { error: "Invalid email or password" };
    }
    throw e;
  }

  // Resolve destination from the DB (reliable within this request) rather than
  // the freshly-set session cookie.
  const user = await prisma.user.findUnique({
    where: { email },
    include: { vendor: true },
  });

  redirect(homePathForRole(user?.role, user?.vendor?.status));
}

/**
 * Sign a just-registered user in without redirecting (the caller redirects).
 * A failure here is non-fatal: the account exists, they can log in manually.
 */
async function signInOrThrow(email: string, password: string) {
  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (e) {
    if (e instanceof AuthError) return;
    throw e;
  }
}

// ─────────────────────────────────────────────────────────────
// Update profile (customer dashboard)
// ─────────────────────────────────────────────────────────────
export async function updateProfile(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  const parsed = updateProfileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { fieldErrors: firstErrors(parsed.error.flatten().fieldErrors) };
  }

  const { firstName, lastName, phone, newPassword } = parsed.data;
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();

  const data: { name: string; phone: string | null; passwordHash?: string } = {
    name,
    phone: phone ? phone : null,
  };
  if (newPassword) {
    data.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  try {
    await prisma.user.update({ where: { id: session.user.id }, data });
  } catch {
    return { error: "Couldn't save your profile. Please try again." };
  }

  revalidatePath("/dashboard");
  return {};
}

// ─────────────────────────────────────────────────────────────
// Sign out
// ─────────────────────────────────────────────────────────────
export async function signOutAction(redirectTo: string = "/login") {
  await signOut({ redirectTo });
}
