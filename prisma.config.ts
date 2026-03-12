import { defineConfig } from "prisma/config";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Add it to your .env.local file.\n" +
      "Example: DATABASE_URL=postgresql://hydra:hydra@localhost:5432/app_auth"
  );
}

export default defineConfig({
  datasource: {
    url: databaseUrl,
  },
});
