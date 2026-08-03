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
import {
  saveUserImage,
  deleteUserImage,
  FileValidationError,
} from "@/lib/customer-profile-upload";

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

  const userId = session.user.id;

  const parsed = updateProfileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    image: formData.get("image"),
  });

  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: firstErrors(parsed.error.flatten().fieldErrors),
    };
  }

  const { firstName, lastName, email, phone, image } = parsed.data;
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();

  // Email must not collide with ANOTHER user's account.
  const clash = await prisma.user.findFirst({
    where: { email, NOT: { id: userId } },
    select: { id: true },
  });
  if (clash) {
    return {
      error: "That email is already in use.",
      fieldErrors: { email: "That email is already in use" },
    };
  }

  // Current image, so we can delete it AFTER a successful replace/remove.
  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { image: true },
  });

  // Persist a new image (if any) BEFORE the DB write; roll it back on failure.
  let newImage: string | undefined;
  try {
    if (image) newImage = await saveUserImage(image);
  } catch (e) {
    if (e instanceof FileValidationError) {
      return { error: e.message, fieldErrors: { image: e.message } };
    }
    return { error: "Could not process the uploaded image. Please try again." };
  }

  // A new upload always takes precedence over an explicit remove.
  const removeImage = !newImage && formData.get("removeImage") === "true";

  const data: Prisma.UserUpdateInput = {
    name,
    email,
    phone: phone ? phone : null,
    ...(newImage ? { image: newImage } : removeImage ? { image: null } : {}),
  };

  try {
    await prisma.user.update({ where: { id: userId }, data });
  } catch (e) {
    if (newImage) await deleteUserImage(newImage); // roll back the just-saved file
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return {
        error: "That email is already in use.",
        fieldErrors: { email: "That email is already in use" },
      };
    }
    return { error: "Couldn't save your profile. Please try again." };
  }

  // Commit succeeded — delete the previous image that was replaced or removed.
  if (newImage || removeImage) await deleteUserImage(current?.image);

  revalidatePath("/dashboard");
  return {};
}

// ─────────────────────────────────────────────────────────────
// Sign out
// ─────────────────────────────────────────────────────────────
export async function signOutAction(redirectTo: string = "/login") {
  await signOut({ redirectTo });
}
