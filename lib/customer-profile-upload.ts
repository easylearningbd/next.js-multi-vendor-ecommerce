import { writeFile, mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { MAX_IMAGE_BYTES } from "@/lib/brand-validation";

// ─────────────────────────────────────────────────────────────────────────────
// TODO(storage): DEVELOPMENT-ONLY local disk storage. The customer profile photo
//   is public (shown in the account rail), so it lives under /public. Move to a
//   public cloud bucket (S3 / R2 / CDN) for production — /public/uploads does not
//   persist across deploys. Mirrors lib/vendor-profile-upload's saveProfileImage.
// ─────────────────────────────────────────────────────────────────────────────

const USER_IMAGE_DIR = path.join(process.cwd(), "public", "uploads", "users");
const USER_IMAGE_PREFIX = "/uploads/users";

export class FileValidationError extends Error {}

type ImageExt = "jpg" | "png" | "webp";

/** Detect the real image type from magic bytes — never trust the client MIME. */
function sniffImageExt(buf: Uint8Array): ImageExt | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) {
    return "png";
  }
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) {
    return "webp";
  }
  return null;
}

/**
 * Persist a customer profile image (jpg/png/webp, ≤2MB). Validates size and the
 * REAL type via magic bytes (not the client MIME), writes a uuid-named file, and
 * returns a public path like `/uploads/users/<uuid>.jpg`.
 */
export async function saveUserImage(file: File): Promise<string> {
  if (!file || file.size === 0) throw new FileValidationError("Please choose an image file");
  if (file.size > MAX_IMAGE_BYTES) throw new FileValidationError("Image must be 2MB or smaller");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = sniffImageExt(bytes);
  if (!ext) throw new FileValidationError("Only JPG, PNG or WebP images are allowed");

  await mkdir(USER_IMAGE_DIR, { recursive: true });
  const filename = `${uuidv4()}.${ext}`;
  await writeFile(path.join(USER_IMAGE_DIR, filename), bytes);
  return `${USER_IMAGE_PREFIX}/${filename}`;
}

/** Best-effort delete of a previously stored profile image. */
export async function deleteUserImage(value: string | null | undefined): Promise<void> {
  if (!value || !value.startsWith(`${USER_IMAGE_PREFIX}/`) || value.includes("..")) return;
  try {
    await unlink(path.join(USER_IMAGE_DIR, path.basename(value)));
  } catch {
    // already gone — nothing to do
  }
}
