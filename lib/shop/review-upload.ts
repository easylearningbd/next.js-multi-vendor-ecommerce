import { writeFile, mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { MAX_IMAGE_BYTES } from "@/lib/brand-validation";

// DEV-ONLY local disk storage (see lib/customer-profile-upload for the storage TODO).
const REVIEW_IMAGE_DIR = path.join(process.cwd(), "public", "uploads", "reviews");
const REVIEW_IMAGE_PREFIX = "/uploads/reviews";

export class ReviewFileError extends Error {}

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

/** Persist a review photo (jpg/png/webp, ≤2MB). Returns a public path. */
export async function saveReviewImage(file: File): Promise<string> {
  if (!file || file.size === 0) throw new ReviewFileError("Please choose an image file");
  if (file.size > MAX_IMAGE_BYTES) throw new ReviewFileError("Image must be 2MB or smaller");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = sniffImageExt(bytes);
  if (!ext) throw new ReviewFileError("Only JPG, PNG or WebP images are allowed");

  await mkdir(REVIEW_IMAGE_DIR, { recursive: true });
  const filename = `${uuidv4()}.${ext}`;
  await writeFile(path.join(REVIEW_IMAGE_DIR, filename), bytes);
  return `${REVIEW_IMAGE_PREFIX}/${filename}`;
}

/** Best-effort delete of a stored review photo. */
export async function deleteReviewImage(value: string | null | undefined): Promise<void> {
  if (!value || !value.startsWith(`${REVIEW_IMAGE_PREFIX}/`) || value.includes("..")) return;
  try {
    await unlink(path.join(REVIEW_IMAGE_DIR, path.basename(value)));
  } catch {
    // already gone
  }
}
