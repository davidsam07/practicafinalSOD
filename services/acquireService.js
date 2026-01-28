// acquire/services/acquireService.js
require("dotenv").config();

const AcquireData = require("../models/AcquireData");

// =======================
// ENV
// =======================
const KUNNA_URL = process.env.KUNNA_URL;
const KUNNA_ALIAS = process.env.KUNNA_ALIAS;

if (!KUNNA_URL) throw new Error("❌ MISSING_ENV: KUNNA_URL");
if (!KUNNA_ALIAS) throw new Error("❌ MISSING_ENV: KUNNA_ALIAS");

// =======================
// SERVICE STATE
// =======================
let serviceReady = true;

function getAcquireStatus() {
  return {
    ready: serviceReady,
    message: serviceReady ? "Acquire service ready" : "Acquire service not ready",
  };
}

// =======================
// KUNNA FETCH
// =======================
async function fetchKunna(timeStart, timeEnd) {
  const body = {
    time_start: timeStart.toISOString(),
    time_end: timeEnd.toISOString(),
    filters: [
      { filter: "name", values: ["1d"] },
      { filter: "alias", values: [KUNNA_ALIAS] },
    ],
    limit: 100,
    count: false,
    order: "DESC",
  };

  const response = await fetch(KUNNA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`KUNNA_BAD_STATUS:${response.status}`);
  }

  const json = await response.json();
  const result = json.result;

  if (!result || !Array.isArray(result.columns) || !Array.isArray(result.values)) {
    throw new Error("KUNNA_INVALID_RESULT");
  }

  return result;
}

// =======================
// TIME RANGE
// =======================
function calculateTimeRange(targetDate) {
  const target = new Date(targetDate);
  const hour = target.getHours();

  let predictionDate = new Date(target);
  if (hour >= 23) predictionDate.setDate(predictionDate.getDate() + 1);

  const timeEnd = new Date(predictionDate);
  timeEnd.setDate(timeEnd.getDate() - 1);

  const timeStart = new Date(timeEnd);
  timeStart.setDate(timeStart.getDate() - 3);

  return { timeStart, timeEnd, predictionDate };
}

// =======================
// PROCESS DATA
// =======================
function processKunnaData(kunnaData) {
  const { columns, values } = kunnaData;

  return values.map((row) => {
    const obj = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj;
  });
}

// =======================
// FEATURE EXTRACTION (7)
// =======================
function extractFeatures(processedData, predictionDate) {
  if (!processedData || processedData.length === 0) {
    return [0, 0, 0, 0, 0, 0, 0];
  }

  const values = processedData
    .map((row) => parseFloat(row.value))
    .filter((v) => Number.isFinite(v));

  const consumo_t = values.at(-1) || 0;
  const consumo_t_1 = values.at(-2) || 0;
  const consumo_t_2 = values.at(-3) || 0;

  const hora = predictionDate.getHours();
  const dia_semana = predictionDate.getDay();
  const mes = predictionDate.getMonth() + 1;
  const dia_mes = predictionDate.getDate();

  return [
    consumo_t,
    consumo_t_1,
    consumo_t_2,
    hora,
    dia_semana,
    mes,
    dia_mes,
  ];
}

// =======================
// MAIN ACQUIRE
// =======================
async function acquireData(targetDate = new Date()) {
  const { timeStart, timeEnd, predictionDate } =
    calculateTimeRange(targetDate);

  console.log("[ACQUIRE] Target date:", targetDate.toISOString());
  console.log("[ACQUIRE] Prediction date:", predictionDate.toISOString());
  console.log("[ACQUIRE] Time range:", {
    start: timeStart.toISOString(),
    end: timeEnd.toISOString(),
  });

  const kunnaData = await fetchKunna(timeStart, timeEnd);

  console.log("[ACQUIRE] Datos obtenidos:", {
    columns: kunnaData.columns,
    rowCount: kunnaData.values.length,
  });

  const processedData = processKunnaData(kunnaData);
  const features = extractFeatures(processedData, predictionDate);

  const saved = await new AcquireData({
    targetDate,
    predictionDate,
    timeRange: {
      start: timeStart,
      end: timeEnd,
    },
    rawData: processedData,
    features,
  }).save();

  console.log("[ACQUIRE] Guardado con ID:", saved._id);
  console.log("[ACQUIRE] Features:", features);

  return {
    dataId: saved._id.toString(),
    features,
    featureCount: 7,
    scalerVersion: "v1",
    createdAt: saved.createdAt,
  };
}

// =======================
module.exports = {
  getAcquireStatus,
  acquireData,
};
