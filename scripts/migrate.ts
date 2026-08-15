import { Client } from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  
  const schemaPath = path.join(process.cwd(), "backend/database/schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");

  console.log("Applying schema to Neon...");
  await client.query(sql);
  console.log("Schema applied successfully.");

  // Also create a test user so we have an admin to log in as?
  // Not yet, we'll implement auth endpoints next.

  await client.end();
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
