const ActivityLog = require("../models/ActivityLog");

const logActivity = async ({ actor, action, entityType, entityId, metadata = {} }) => {
  try {
    await ActivityLog.create({
      actor: actor || null,
      action,
      entityType,
      entityId: entityId || null,
      metadata,
    });
  } catch (error) {
    // Do not break API flow because of logging failure.
    console.error("Activity log write failed:", error.message);
  }
};

module.exports = { logActivity };
