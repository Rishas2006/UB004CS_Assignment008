const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const config = require("./config");
const { notFoundHandler, errorHandler } = require("./middleware/error");

const app = express();
app.set("trust proxy", config.trustProxy); // behind the Vercel proxy: correct client IP for rate limiting
app.disable("x-powered-by");

app.use(helmet());
app.use(
  cors({
    origin(origin, cb) {
      // allow same-origin tools (no Origin header) and the configured frontends only
      if (!origin || config.corsOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  }),
);
// Serverless platforms freeze the function once the response has ended: wait for fire-and-forget work (audit rows, e-mails) first.
app.use((req, res, next) => {
  req.pending = [];
  const end = res.end;
  res.end = function patchedEnd(...args) {
    if (!req.pending.length) return end.apply(this, args);
    Promise.allSettled(req.pending).finally(() => end.apply(this, args));
    return this;
  };
  next();
});
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
if (config.env !== "test") app.use(morgan(config.isProd ? "combined" : "dev"));

const limiter = (windowMin, max, message) =>
  rateLimit({
    windowMs: windowMin * 60_000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { code: "rate_limited", message } },
  });
app.use("/api/", limiter(15, 5000, "Too many requests. Please slow down."));

app.get("/health", (_req, res) =>
  res.json({ status: "ok", time: new Date().toISOString() }),
);
app.get("/api/v1/health", async (_req, res) => {
  try {
    await require("./db").query("SELECT 1");
    res.json({ status: "ok", db: "up" });
  } catch {
    res.status(503).json({ status: "degraded", db: "down" });
  }
});

const v1 = express.Router();
v1.use(
  "/auth",
  limiter(15, 30, "Too many attempts. Try again later."),
  require("./routes/auth"),
);
v1.use(
  "/ai",
  limiter(1, 15, "AI is busy. Please wait a moment."),
  require("./routes/ai"),
);
v1.use("/ambulance", require("./routes/ambulance"));
v1.use("/appointments", require("./routes/appointments"));
v1.use("/queue", require("./routes/queue"));
v1.use("/patients", require("./routes/patients"));
v1.use("/billing", require("./routes/billing"));
v1.use("/pharmacy", require("./routes/pharmacy"));
v1.use("/hr", require("./routes/hr"));
v1.use("/admin", require("./routes/admin"));
v1.use("/clinical", require("./routes/clinical"));

// ✅ UPDATED: Nee Ketka maadhiri - Option Kudutha mattum Request Pogum!
// GET = User Option Click panni Paakura Data, Adhukku Limit Illa
// POST / PUT / PATCH / DELETE = Form Submit mattum, Adhukku mattum 60 min ku 40 Limit
const publicPostLimiter = limiter(
  60,
  40,
  "Too many submissions. Please try later.",
);
v1.use("/", (req, res, next) => {
  if (
    req.method === "POST" ||
    req.method === "PUT" ||
    req.method === "PATCH" ||
    req.method === "DELETE"
  ) {
    return publicPostLimiter(req, res, next);
  }
  next(); // GET, HEAD, OPTIONS ellam Free ah Pogattum
});
v1.use("/", require("./routes/public"));
app.use("/api/v1", v1);
app.use("/api/cron", require("./routes/cron")); // Vercel Cron (protected by CRON_SECRET)

app.use(notFoundHandler);
app.use(errorHandler);
module.exports = app;
