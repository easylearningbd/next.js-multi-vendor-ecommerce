import { writeFile, mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { MAX_IMAGE_BYTES } from "@/lib/brand-validation";

// ─────────────────────────────────────────────────────────────
// TODO(storage): DEVELOPMENT-ONLY local disk storage, same as brand/category.
// Move vendor image + certificate storage to a cloud object store (S3 / R2)
// before production — /public/uploads does not persist across deploys.
// ─────────────────────────────────────────────────────────────

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "vendors");
const PUBLIC_PREFIX = "/uploads/vendors";

export class FileValidationError extends Error {}

/** Detect real file type from magic bytes — never trust the client MIME. */
function sniffExt(buf: Uint8Array): "jpg" | "png" | "webp" | "pdf" | null {
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

async function persist(file: File, allowed: ReadonlyArray<string>): Promise<string> {
  if (!file || file.size === 0) throw new FileValidationError("Please choose a file");
  if (file.size > MAX_IMAGE_BYTES) throw new FileValidationError("File must be 2MB or smaller");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = sniffExt(bytes);
  if (!ext || !allowed.includes(ext)) {
    throw new FileValidationError(
      allowed.includes("pdf")
        ? "Only PDF, JPG, PNG or WebP files are allowed"
        : "Only JPG, PNG or WebP images are allowed",
    );
  }
  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${uuidv4()}.${ext}`;
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);
  return `${PUBLIC_PREFIX}/${filename}`;
}

/** Validate (magic bytes + size) and persist a vendor image (jpg/png/webp). */
export function saveVendorImage(file: File): Promise<string> {
  return persist(file, ["jpg", "png", "webp"]);
}

/** Validate and persist a TIN certificate (pdf or image). */
export function saveVendorCertificate(file: File): Promise<string> {
  return persist(file, ["pdf", "jpg", "png", "webp"]);
}

/** Best-effort delete of a stored vendor file. */
export async function deleteVendorFile(publicPath: string | null | undefined): Promise<void> {
  if (!publicPath) return;
  if (!publicPath.startsWith(`${PUBLIC_PREFIX}/`)) return;
  try {
    await unlink(path.join(UPLOAD_DIR, path.basename(publicPath)));
  } catch {
    // already gone
  }
}
