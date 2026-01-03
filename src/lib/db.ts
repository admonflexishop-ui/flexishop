// src/lib/db.ts
import { createClient } from "@libsql/client";

export const db = createClient({
  url: process.env.URL_DB!,
  authToken: process.env.TOKEN_DB!,
});
