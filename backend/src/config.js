require("dotenv").config();
const { cleanDatabaseUrl } = require("./sqlutil");

const required = (name, fallback) => {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === "")
    throw new Error(`Missing environment variable ${name}`);
  return v;
};
const isProd = process.env.NODE_ENV === "production";

/**
 * PostgreSQL / Supabase connection settings.
 *   DATABASE_URL  postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres   (Transaction pooler - use this on Vercel)
 * or the separate DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME variables (local PostgreSQL).
 * DB_SSL: "true" (default for every host except localhost) | "false".
 */
function dbConfig() {
  let c;
  if (process.env.DATABASE_URL) c = cleanDatabaseUrl(process.env.DATABASE_URL);
  else
    c = {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "rh_hms",
    };
  const local = ["localhost", "127.0.0.1", "::1"].includes(c.host);
  const wantSsl = process.env.DB_SSL ? process.env.DB_SSL === "true" : !local;
  // Supabase's pooler certificate chain is not in Node's trust store, so the connection is encrypted without chain verification.
  return {
    ...c,
    ssl: wantSsl ? { rejectUnauthorized: false } : false,
    max: Number(process.env.DB_POOL_MAX || (isProd ? 5 : 10)),
  };
}

const config = {
  env: process.env.NODE_ENV || "development",
  isProd,
  port: Number(process.env.PORT || 4000),
  db: dbConfig(),
  jwt: {
    accessSecret: required(
      "JWT_ACCESS_SECRET",
      isProd ? undefined : "dev-access-secret",
    ),
    refreshSecret: required(
      "JWT_REFRESH_SECRET",
      isProd ? undefined : "dev-refresh-secret",
    ),
    accessTtl: process.env.ACCESS_TTL || "15m",
    refreshDays: Number(process.env.REFRESH_DAYS || 7),
  },
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:3000")
    .split(",")
    .map((s) => s.trim()),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  publicApiUrl: process.env.PUBLIC_API_URL || "http://localhost:4000",
  mail: {
    // Gmail by default: SMTP_HOST=smtp.gmail.com, SMTP_PORT=465, SMTP_USER=<you>@gmail.com, SMTP_PASS=<16-letter App Password>
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 465),
    user: process.env.SMTP_USER || "",
    pass: (process.env.SMTP_PASS || "").replace(/\s+/g, ""), // Google shows the App Password in groups of four: spaces are ignored
    from:
      process.env.MAIL_FROM ||
      (process.env.SMTP_USER
        ? `RH Hospital <${process.env.SMTP_USER}>`
        : "RH Hospital <no-reply@rhhospital.lk>"),
  },
  payhere: {
    merchantId: process.env.PAYHERE_MERCHANT_ID || "",
    merchantSecret: process.env.PAYHERE_MERCHANT_SECRET || "",
    sandbox: process.env.PAYHERE_SANDBOX !== "false",
  },
  cronSecret: process.env.CRON_SECRET || "", // Vercel Cron sends it as "Authorization: Bearer <CRON_SECRET>"
  trustProxy: Number(process.env.TRUST_PROXY || 1), // number of proxies in front of the API (Vercel = 1)
  ai: {
    key: process.env.ANTHROPIC_API_KEY || "",
    model: process.env.AI_MODEL || "claude-sonnet-4-6",
  },
};

module.exports = config;
