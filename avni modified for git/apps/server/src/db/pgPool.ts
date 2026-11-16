import pg from "pg";
import type { Db } from "./settingsRepo.js";

export function pgDb(url: string): Db {
  const pool = new pg.Pool({ connectionString: url, max: 5, ssl: url.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined });
  return {
    query: (sql, params) => pool.query(sql, params),
  };
}
