/**
 * Run this once after deploying to Railway to set up the database tables.
 * In Railway: go to your service → Settings → Deploy → add this as a one-time command.
 * Or run from the Railway shell: node scripts/db-push.mjs
 */
import { execSync } from "child_process";

console.log("Pushing database schema...");
execSync("pnpm --filter @workspace/db push-force", { stdio: "inherit" });
console.log("Database schema pushed successfully.");
