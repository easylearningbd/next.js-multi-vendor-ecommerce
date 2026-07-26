import { writeFile, mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { MAX_IMAGE_BYTES } from "@/lib/brand-validation";
import { MAX_CERT_BYTES } from "@/lib/vendor-profile-validation";

// ─────────────────────────────────────────────────────────────────────────────
// TODO(storage): DEVELOPMENT-ONLY local disk storage.
//   • Public images (logo/cover) → move to a public cloud bucket (S3 / R2 / CDN).
//   • TIN certificate → move to a PRIVATE bucket and serve via short-lived signed
//     URLs. The dir below is "private" only because it sits OUTSIDE /public and is
//     never served by Next; a real deployment must use access-controlled storage.
//   /public/uploads does not persist across deploys.
// ─────────────────────────────────────────────────────────────────────────────

// Public — logo & cover are shown on the storefront, so they live under /public.
const PUBLIC_IMAGE_DIR = path.join(process.cwd(), "public", "uploads", "vendors");
const PUBLIC_IMAGE_PREFIX = "/uploads/vendors";

// Private — the TIN certificate is a tax document. Stored OUTSIDE /public so it is
// NOT reachable at any guessable URL; readable only through an authorized route.
// The DB stores a private KEY like `tin/<uuid>.pdf` (no leading slash), never a URL.
const PRIVATE_TIN_DIR = path.join(process.cwd(), "private-uploads", "tin");
const PRIVATE_TIN_PREFIX = "tin";

export class FileValidationError extends Error {}

type Ext = "jpg" | "png" | "webp" | "pdf";

/** Detect the real file type from magic bytes — never trust the client MIME. */
function sniffExt(buf: Uint8Array): Ext | null {
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
  if (buf.length >= 4 && buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) {
    return "pdf";
  }
  return null;
}

async function readValidated(
  file: File,
  allowed: readonly Ext[],
  maxBytes: number,
  maxLabel: string,
): Promise<{ bytes: Uint8Array; ext: Ext }> {
  if (!file || file.size === 0) throw new FileValidationError("Please choose a file");
  if (file.size > maxBytes) throw new FileValidationError(`File must be ${maxLabel} or smaller`);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = sniffExt(bytes);
  if (!ext || !allowed.includes(ext)) {
    throw new FileValidationError(
      allowed.includes("pdf")
        ? "Only PDF, JPG, PNG or WebP files are allowed"
        : "Only JPG, PNG or WebP images are allowed",
    );
  }
  return { bytes, ext };
}

/** Persist a PUBLIC vendor image (jpg/png/webp, ≤2MB). Returns a public path. */
export async function saveProfileImage(file: File): Promise<string> {
  const { bytes, ext } = await readValidated(file, ["jpg", "png", "webp"], MAX_IMAGE_BYTES, "2MB");
  await mkdir(PUBLIC_IMAGE_DIR, { recursive: true });
  const filename = `${uuidv4()}.${ext}`;
  await writeFile(path.join(PUBLIC_IMAGE_DIR, filename), bytes);
  return `${PUBLIC_IMAGE_PREFIX}/${filename}`;
}

/**
 * Persist a PRIVATE TIN certificate (pdf/jpg/png/webp, ≤5MB). Returns a private
 * key like `tin/<uuid>.pdf` — NOT a public URL. The file is written outside
 * /public and can only be read back through the authorized owner/admin route.
 */
export async function saveTinCertificate(file: File): Promise<string> {
  const { bytes, ext } = await readValidated(
    file,
    ["pdf", "jpg", "png", "webp"],
    MAX_CERT_BYTES,
    "5MB",
  );
  await mkdir(PRIVATE_TIN_DIR, { recursive: true });
  const filename = `${uuidv4()}.${ext}`;
  await writeFile(path.join(PRIVATE_TIN_DIR, filename), bytes);
  return `${PRIVATE_TIN_PREFIX}/${filename}`;
}

/** True when a stored value is a private TIN key (vs a legacy public path). */
export function isPrivateTinKey(value: string | null | undefined): value is string {
  return !!value && value.startsWith(`${PRIVATE_TIN_PREFIX}/`) && !value.includes("..");
}

/**
 * Resolve a private TIN key to an absolute on-disk path, safe against traversal.
 * Returns null for anything that isn't a well-formed private key. For the
 * authorized read route ONLY — the route must still auth the caller first.
 */
export function resolveTinPath(key: string): string | null {
  if (!isPrivateTinKey(key)) return null;
  const filename = path.basename(key); // drop any directory segments
  if (!filename || filename === "." || filename.includes("\\")) return null;
  return path.join(PRIVATE_TIN_DIR, filename);
}

/** Best-guess content type for a stored TIN file, from its extension. */
export function tinContentType(key: string): string {
  switch (path.extname(key).toLowerCase()) {
    case ".pdf":
      return "application/pdf";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    default:
      return "image/jpeg";
  }
}

/** Best-effort delete of a stored profile file (public image OR private TIN). */
export async function deleteProfileFile(value: string | null | undefined): Promise<void> {
  if (!value) return;
  try {
    if (value.startsWith(`${PUBLIC_IMAGE_PREFIX}/`)) {
      await unlink(path.join(PUBLIC_IMAGE_DIR, path.basename(value)));
    } else if (isPrivateTinKey(value)) {
      await unlink(path.join(PRIVATE_TIN_DIR, path.basename(value)));
    }
    // Legacy note: admin-created vendors may have a TIN cert stored under the
    // public prefix (via lib/vendor-upload). Those are handled by the first branch.
  } catch {
    // already gone — nothing to do
  }
}
