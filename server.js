// Configurări server - backend SkinEvo pentru Render.com
// Ultima actualizare: deployment pe Render
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const os = require("os");

// Configurări server - backend SkinEvo
const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for all origins during development
app.use(cors());

// Root endpoint\
app.get("/", (req, res) => {\
  res.status(200).send("SkinEvo Backend is running! Try /ping endpoint.");\
});\
\
// Simple ping endpoint for connection testing
app.get("/ping", (req, res) => {
  console.log("Received ping request");
  res.status(200).send("pong");
});

// Start the server
app.listen(port, "0.0.0.0", () => {
  console.log(`Backend server running on port ${port}`);
  console.log(`App is running at: http://localhost:${port}`);
  console.log("Available endpoints:");
  console.log("- GET /      - Root endpoint");\nconsolet.log("- GET /ping  - Test connection endpoint");
});
