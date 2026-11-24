const router = require("express").Router();
const { z } = require("zod");
const { query, tx, uuid } = require("../db");
const {
  AppError,
  asyncHandler,
  validate,
  notFound,
  makeRef,
} = require("../utils");
const { authenticate, authorize } = require("../middleware/auth");
const { audit } = require("../middleware/audit");

const STATUSES = [
  "REQUESTED",
  "DISPATCHED",
  "ON_SCENE",
  "TRANSPORTING",
  "ARRIVED",
  "CLOSED",
  "CANCELLED",
];

// ---------- PUBLIC: emergency request + tracking ----------
router.post(
  "/requests",
  validate(
    z.object({
      callerName: z.string().trim().min(2).max(80),
      phone: z
        .string()
        .trim()
        .regex(/^\+?[0-9 ]{9,15}$/, "Enter a valid phone number"),
      address: z.string().trim().min(5).max(250),
      lat: z.number().min(-90).max(90).optional(),
      lng: z.number().min(-180).max(180).optional(),
      notes: z.string().trim().max(500).optional(),
    }),
  ),
  asyncHandler(async (req, res) => {
    const b = req.body;
    const ref = makeRef("AMB", 5);
    await query(
      `INSERT INTO ambulance_requests (id, ref, caller_name, phone, address, lat, lng, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        uuid(),
        ref,
        b.callerName,
        b.phone,
        b.address,
        b.lat ?? null,
        b.lng ?? null,
        b.notes || null,
      ],
    );
    req.app.get("io")?.to("ambulance").emit("ambulance:new", { ref });
    res
      .status(201)
      .json({
        ref,
        status: "REQUESTED",
        message:
          "Request received. Dispatch will call you. For life-threatening emergencies call 1990.",
      });
  }),
);

router.get(
  "/track/:ref",
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT r.ref, r.status, r.created_at AS "createdAt", v.plate, v.lat AS "vehicleLat", v.lng AS "vehicleLng", r.lat AS lat, r.lng AS lng
    FROM ambulance_requests r LEFT JOIN ambulance_vehicles v ON v.id = r.vehicle_id WHERE r.ref = $1`,
      [req.params.ref],
    );
    if (!rows[0]) throw notFound("Request not found");
    const r = rows[0];
    let etaMinutes = null;
    if (
      r.vehicleLat != null &&
      r.lat != null &&
      ["DISPATCHED", "TRANSPORTING"].includes(r.status)
    ) {
      const km = Math.hypot(
        (r.vehicleLat - r.lat) * 111,
        (r.vehicleLng - r.lng) * 110,
      ); // rough straight-line distance
      etaMinutes = Math.max(1, Math.round((km / 40) * 60)); // assumes ~40 km/h average
    }
    res.set("Cache-Control", "no-store");
    res.json({ ...r, etaMinutes });
  }),
);

// ---------- STAFF ----------
router.use(authenticate, authorize("ambulance", "branch-admin"));

router.get(
  "/requests",
  asyncHandler(async (_req, res) => {
    const { rows } =
      await query(`SELECT r.id, r.ref, r.caller_name AS "callerName", r.phone, r.address, r.status, r.notes, v.plate, r.created_at AS date
    FROM ambulance_requests r LEFT JOIN ambulance_vehicles v ON v.id = r.vehicle_id ORDER BY r.created_at DESC LIMIT 100`);
    res.json(rows);
  }),
);
router.get(
  "/vehicles",
  asyncHandler(async (_req, res) =>
    res.json(
      (
        await query(
          "SELECT id, plate, branch_id AS branch, status, lat, lng FROM ambulance_vehicles ORDER BY plate",
        )
      ).rows,
    ),
  ),
);

router.patch(
  "/requests/:id",
  validate(
    z.object({
      status: z.enum(STATUSES),
      vehicleId: z.number().int().positive().optional(),
    }),
  ),
  asyncHandler(async (req, res) => {
    await tx(async (c) => {
      const r = (
        await c.query(
          "SELECT * FROM ambulance_requests WHERE id = $1 FOR UPDATE",
          [req.params.id],
        )
      ).rows[0];
      if (!r) throw notFound("Request not found");
      if (["CLOSED", "CANCELLED"].includes(r.status))
        throw new AppError(409, "Request already finished", "bad_state");
      let vehicleId = r.vehicle_id;
      if (req.body.status === "DISPATCHED") {
        vehicleId = req.body.vehicleId || vehicleId;
        if (!vehicleId)
          throw new AppError(
            422,
            "vehicleId is required to dispatch",
            "validation_error",
          );
        const v = await c.query(
          `UPDATE ambulance_vehicles SET status = 'BUSY' WHERE id = $1 AND status = 'AVAILABLE'`,
          [vehicleId],
        );
        if (!v.rowCount && vehicleId !== r.vehicle_id)
          throw new AppError(409, "Vehicle is not available", "bad_state");
      }
      if (
        ["ARRIVED", "CLOSED", "CANCELLED"].includes(req.body.status) &&
        vehicleId
      )
        await c.query(
          `UPDATE ambulance_vehicles SET status = 'AVAILABLE' WHERE id = $1`,
          [vehicleId],
        );
      await c.query(
        "UPDATE ambulance_requests SET status = $1, vehicle_id = $2 WHERE id = $3",
        [req.body.status, vehicleId, req.params.id],
      );
      req.app
        .get("io")
        ?.to(`amb:${r.ref}`)
        .emit("ambulance:status", { ref: r.ref, status: req.body.status });
    });
    audit(req, "ambulance.status", "ambulance_request", req.params.id, {
      to: req.body.status,
    });
    res.json({ message: "Updated" });
  }),
);

/** Driver app posts GPS position every few seconds */
router.post(
  "/vehicles/:id/position",
  validate(
    z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
  ),
  asyncHandler(async (req, res) => {
    const upd = await query(
      "UPDATE ambulance_vehicles SET lat = $1, lng = $2, updated_at = NOW() WHERE id = $3",
      [req.body.lat, req.body.lng, req.params.id],
    );
    if (!upd.rowCount) throw notFound("Vehicle not found");
    const active = await query(
      `SELECT ref FROM ambulance_requests WHERE vehicle_id = $1 AND status IN ('DISPATCHED','ON_SCENE','TRANSPORTING')`,
      [req.params.id],
    );
    for (const a of active.rows)
      req.app
        .get("io")
        ?.to(`amb:${a.ref}`)
        .emit("ambulance:position", {
          ref: a.ref,
          lat: req.body.lat,
          lng: req.body.lng,
        });
    res.json({ ok: true });
  }),
);

module.exports = router;
