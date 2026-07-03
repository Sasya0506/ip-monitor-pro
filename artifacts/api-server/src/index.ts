import app from "./app.js";
import { logger } from "./lib/logger.js";
import { db, adminUsersTable } from "@workspace/db";
import bcrypt from "bcryptjs";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function seedAdminUser() {
  const existing = await db.select().from(adminUsersTable).limit(1);
  if (existing.length === 0) {
    const passwordHash = await bcrypt.hash("admin123", 12);
    await db.insert(adminUsersTable).values({
      username: "admin",
      passwordHash,
    });
    logger.info("Default admin user created: admin / admin123");
  }
}

seedAdminUser().catch((err) => {
  logger.error(err, "Failed to seed admin user");
});

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
