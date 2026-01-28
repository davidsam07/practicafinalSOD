// controllers/acquireController.js
const { acquireData, getAcquireStatus } = require("../services/acquireService");

// Health check
function health(req, res) {
  res.json({
    status: "ok",
    service: "acquire"
  });
}

// Ready check
function ready(req, res) {
  const status = getAcquireStatus();
  res.json(status);
}

// Endpoint principal
async function doAcquire(req, res) {
  try {
    // targetDate es opcional
    const targetDate = req.body.targetDate
      ? new Date(req.body.targetDate)
      : new Date();

    const result = await acquireData(targetDate);

    res.status(201).json({
      dataId: result.dataId,
      features: result.features,
      featureCount: result.featureCount,
      scalerVersion: result.scalerVersion,
      createdAt: result.createdAt
    });
  } catch (err) {
    console.error("[ACQUIRE] Error:", err);
    res.status(500).json({
      error: "Internal error",
      message: err.message
    });
  }
}

module.exports = {
  health,
  ready,
  doAcquire
};