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

// Parse JSON request bodies
app.use(bodyParser.json({ limit: '50mb' }));

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).send("SkinEvo Backend is running! Try /ping endpoint.");
});

// Simple ping endpoint for connection testing
app.get("/ping", (req, res) => {
  console.log("Received ping request");
  res.status(200).send("pong");
});

// Analyze skin endpoint
app.post("/analyze-skin", (req, res) => {
  console.log("Received request to /analyze-skin");
  
  try {
    const { photos } = req.body;
    
    if (!photos) {
      console.log("Error: No photos in request");
      return res.status(400).json({ error: "No photos provided" });
    }
    
    console.log("Processing skin analysis request...");

    const mockAnalysis = `Analiză piele:

Pe baza fotografiilor, am detectat următoarele:
- Piele cu tendință ușoară spre deshidratare
- Roșeață în zona T
- Semne de sensibilitate la factorii de mediu

Recomandări:
1. Folosiți un cleanser blând, fără sulfați
2. Aplicați serum cu acid hialuronic dimineața
3. Folosiți o cremă hidratantă cu ceramide seara
4. Aplicați SPF 30+ zilnic, chiar și în zilele înnorate

Evitați produsele cu parfum și alcool care pot irita pielea sensibilă.`;

    setTimeout(() => {
      console.log("Sending analysis response");
      res.json({ result: mockAnalysis });
    }, 2000);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
});

// Start the server - asiguram ca ascultam pe toate interfetele (0.0.0.0) pentru Render
app.listen(port, "0.0.0.0", () => {
  console.log(`Backend server running on port ${port}`);
  console.log(`App is running at: http://localhost:${port}`);
  console.log("Available endpoints:");
  console.log("- GET /      - Root endpoint");
  console.log("- GET /ping  - Test connection endpoint");
  console.log("- POST /analyze-skin - Skin analysis endpoint");
});

// Handle server errors
app.on("error", (error) => {
  console.error("Server error:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});
