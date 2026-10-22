const AuditLog = require("../models/AuditLog");
const { extractClientIp } = require("./deviceInfo");

const recordAuditLog = async ({
  req = null,
  actorType = "System",
  actorId = null,
  actorEmail = null,
  action,
  module,
  targetId = null,
  description,
  changes = null,
}) => {
  try {
    const ipAddress = req ? extractClientIp(req) : "127.0.0.1";
    const userAgent = req ? String(req.headers["user-agent"] || "").slice(0, 300) : "";

    await AuditLog.create({
      actorType,
      actorId,
      actorEmail,
      action,
      module,
      targetId: targetId ? String(targetId) : null,
      description,
      changes,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    // Non-fatal logging error
    console.error("[AuditLogger] Failed to write audit log:", err.message);
  }
};

module.exports = {
  recordAuditLog,
};
