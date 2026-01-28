const mongoose = require("mongoose");

const AcquireDataSchema = new mongoose.Schema(
  {
    targetDate: { type: Date, required: true },
    predictionDate: { type: Date, required: true },
    timeRange: {
      start: { type: Date, required: true },
      end: { type: Date, required: true }
    },
    rawData: { type: Array, default: [] },
    features: { type: [Number], required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AcquireData", AcquireDataSchema);
