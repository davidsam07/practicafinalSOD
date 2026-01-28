// routes/acquireRoutes.js
const express = require("express");
const router = express.Router();
const acquireController = require("../controllers/acquireController");

// Health check
router.get("/health", acquireController.health);

// Ready check
router.get("/ready", acquireController.ready);

// Endpoint principal de acquire
router.post("/data", acquireController.doAcquire);

module.exports = router;
