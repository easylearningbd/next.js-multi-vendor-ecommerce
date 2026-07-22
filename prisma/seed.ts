import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@covet.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "Admin@12345";
  const name = process.env.ADMIN_NAME ?? "Covet Admin";

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: Role.ADMIN, name },
    create: { email, name, passwordHash, role: Role.ADMIN },
  });

  console.log("\n────────────────────────────────────────────");
  console.log("  Admin account seeded");
  console.log("────────────────────────────────────────────");
  console.log(`  Email    : ${admin.email}`);
  console.log(`  Password : ${password}`);
  console.log(`  Role     : ${admin.role}`);
  console.log("────────────────────────────────────────────");
  console.log("  Sign in at /admin/login");
  console.log("────────────────────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
