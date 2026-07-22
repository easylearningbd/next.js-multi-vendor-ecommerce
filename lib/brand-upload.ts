import { writeFile, mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { MAX_IMAGE_BYTES } from "@/lib/brand-validation";

// ─────────────────────────────────────────────────────────────
// TODO(storage): This writes uploads to the local /public folder, which is a
// DEVELOPMENT-ONLY approach. Before production, move brand image storage to a
// cloud object store (S3 / Cloudflare R2) and store the returned URL instead.
// Local disk does not persist across deploys and is not multi-instance safe.
// ─────────────────────────────────────────────────────────────

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "brands");
const PUBLIC_PREFIX = "/uploads/brands";

/** Raised when server-side image validation fails; surfaced as a friendly error. */
export class ImageValidationError extends Error {}

/**
 * Detect the real image type from the file's magic bytes — NEVER trust the
 * client-reported MIME (a .pdf renamed to .jpg must be rejected here).
 */
function sniffImageExt(buf: Uint8Array): "jpg" | "png" | "webp" | null {
  // JPEG: FF D8 FF
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "jpg";
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) {
    return "png";
  }
  // WEBP: "RIFF"...."WEBP"
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
 * Validate (size + magic bytes) and persist an uploaded brand image under a
 * generated uuid filename. Returns the public path (e.g. /uploads/brands/xxx.png).
 * Throws ImageValidationError on invalid input.
 */
export async function saveBrandImage(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new ImageValidationError("Please choose an image file");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ImageValidationError("Image must be 2MB or smaller");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = sniffImageExt(bytes);
  if (!ext) {
    throw new ImageValidationError("Only JPG, PNG or WebP images are allowed");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${uuidv4()}.${ext}`; // never the user's original filename
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);
  return `${PUBLIC_PREFIX}/${filename}`;
}

/** Best-effort delete of a previously stored brand image. */
export async function deleteBrandImage(publicPath: string | null | undefined): Promise<void> {
  if (!publicPath) return;
  // Safety: only ever unlink files inside our managed upload folder.
  if (!publicPath.startsWith(`${PUBLIC_PREFIX}/`)) return;
  const filename = path.basename(publicPath);
  try {
    await unlink(path.join(UPLOAD_DIR, filename));
  } catch {
    // Already removed or never existed — nothing to do.
  }
}
