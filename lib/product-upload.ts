import { writeFile, mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { MAX_IMAGE_BYTES } from "@/lib/brand-validation";

// ─────────────────────────────────────────────────────────────────────────────
// TODO(storage): DEVELOPMENT-ONLY local disk storage (same as brand/vendor). Move
// product images to a cloud object store (S3 / R2 / CDN) before production —
// /public/uploads does not persist across deploys.
// ─────────────────────────────────────────────────────────────────────────────

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");
const PUBLIC_PREFIX = "/uploads/products";

export class FileValidationError extends Error {}

/** Detect the real image type from magic bytes — never trust the client MIME. */
function sniffExt(buf: Uint8Array): "jpg" | "png" | "webp" | null {
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

/** Validate (magic bytes + size) and persist a product image. Returns a public path. */
export async function saveProductImage(file: File): Promise<string> {
  if (!file || file.size === 0) throw new FileValidationError("Please choose an image");
  if (file.size > MAX_IMAGE_BYTES) throw new FileValidationError("Image must be 2MB or smaller");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = sniffExt(bytes);
  if (!ext) throw new FileValidationError("Only JPG, PNG or WebP images are allowed");
  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${uuidv4()}.${ext}`;
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);
  return `${PUBLIC_PREFIX}/${filename}`;
}

/** Best-effort delete of a stored product image (ignores non-product paths). */
export async function deleteProductFile(publicPath: string | null | undefined): Promise<void> {
  if (!publicPath || !publicPath.startsWith(`${PUBLIC_PREFIX}/`)) return;
  try {
    await unlink(path.join(UPLOAD_DIR, path.basename(publicPath)));
  } catch {
    // already gone
  }
}
