import { readFile } from "node:fs/promises";
import path from "node:path";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resolveTinPath, tinContentType, isPrivateTinKey } from "@/lib/vendor-profile-upload";

// GET /vendor/profile/tin
// Streams a vendor's TIN certificate (a private tax document) back ONLY to an
// authorized caller: the owning vendor (their own cert), or an ADMIN passing
// ?vendorId=. The file lives outside /public and is never otherwise reachable.
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  let cert: string | null = null;
  if (session.user.role === "VENDOR") {
    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
      select: { tinCertificate: true },
    });
    cert = vendor?.tinCertificate ?? null;
  } else if (session.user.role === "ADMIN") {
    const vendorId = req.nextUrl.searchParams.get("vendorId");
    if (!vendorId) return new Response("Missing vendorId", { status: 400 });
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { tinCertificate: true },
    });
    cert = vendor?.tinCertificate ?? null;
  } else {
    return new Response("Forbidden", { status: 403 });
  }

  if (!cert) return new Response("Not found", { status: 404 });

  // Legacy: admin-created vendors stored the cert under /public (old flow). It's
  // already publicly reachable, so just redirect there.
  if (!isPrivateTinKey(cert)) {
    return Response.redirect(new URL(cert, req.nextUrl.origin));
  }

  const abs = resolveTinPath(cert);
  if (!abs) return new Response("Not found", { status: 404 });

  let bytes: Buffer;
  try {
    bytes = await readFile(abs);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": tinContentType(cert),
      "Content-Disposition": `inline; filename="tin-certificate${path.extname(cert)}"`,
      // Never let a shared cache hold a private document.
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
