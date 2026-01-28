// acquire/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const acquireRoutes = require("./routes/acquireRoutes");

const PORT = process.env.PORT || 3003;
const MONGO_URI = process.env.MONGO_URI;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", acquireRoutes);

app.use((req, res) => res.status(404).json({ error: "NOT_FOUND" }));

app.use((err, req, res, next) => {
  console.error("[ACQUIRE] Unhandled:", err);
  res.status(500).json({ error: "INTERNAL_ERROR", message: err.message });
});

(async () => {
  try {
    console.log("Conectando a MongoDB...");// acquire/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const acquireRoutes = require("./routes/acquireRoutes");

const PORT = process.env.PORT || 3003;
const MONGO_URI = process.env.MONGO_URI;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", acquireRoutes);

app.use((req, res) => res.status(404).json({ error: "NOT_FOUND" }));

app.use((err, req, res, next) => {
  console.error("[ACQUIRE] Unhandled:", err);
  res.status(500).json({ error: "INTERNAL_ERROR", message: err.message });
});

(async () => {
  try {
    console.log("Conectando a MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB conectado exitosamente");

    app.listen(PORT, () => {
      console.log("================================");
      console.log("ACQUIRE SERVICE");
      console.log(`Server running on port ${PORT}`);
      console.log(`URL: http://localhost:${PORT}`);
      console.log(`MongoDB: ${MONGO_URI}`);
      console.log("================================");
    });
  } catch (err) {
    console.error("❌ Mongo error:", err.message);
    process.exit(1);
  }
})();

    await mongoose.connect(MONGO_URI);
    console.log("MongoDB conectado exitosamente");

    app.listen(PORT, () => {
      console.log("================================");
      console.log("ACQUIRE SERVICE");
      console.log(`Server running on port ${PORT}`);
      console.log(`URL: http://localhost:${PORT}`);
      console.log(`MongoDB: ${MONGO_URI}`);
      console.log("================================");
    });
  } catch (err) {
    console.error("❌ Mongo error:", err.message);
    process.exit(1);
  }
})();
