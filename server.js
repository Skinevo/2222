// Configurări server - backend SkinEvo pentru Render.com
// Ultima actualizare: deployment pe Render
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const os = require("os");
const axios = require("axios");

// Configurări server - backend SkinEvo
const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for all origins during development
app.use(cors());

// Parse JSON request bodies
app.use(bodyParser.json({ limit: '50mb' }));

// OpenAI API Key - folosește variabilă de mediu pentru siguranță
// Pe Render.com, setează această variabilă în dashboard
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "sk-your-key-here";

// Simple ping endpoint for connection testing
app.get("/ping", (req, res) => {
  console.log("Received ping request");
  res.status(200).send("pong");
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).send("SkinEvo Backend is running! Try /ping endpoint.");
});

// Analyze skin endpoint with OpenAI integration
app.post('/analyze-skin', async (req, res) => {
  console.log('Received request to /analyze-skin');
  
  try {
    const { photos } = req.body;
    
    if (!photos) {
      console.log('Error: No photos in request');
      return res.status(400).json({ error: 'No photos provided' });
    }
    
    console.log('Received photos:');
    Object.keys(photos).forEach(key => {
      try {
        // Verificăm dacă photos[key] este string sau alt tip de date
        if (typeof photos[key] === 'string') {
          console.log(`- ${key}: ${photos[key].substring(0, 50)}...`);
        } else if (photos[key] && typeof photos[key] === 'object') {
          console.log(`- ${key}: [Object data]`);
        } else {
          console.log(`- ${key}: [Data type: ${typeof photos[key]}]`);
        }
      } catch (e) {
        console.log(`- ${key}: [Eroare la afișare: ${e.message}]`);
      }
    });
    
    // Folosim prima imagine disponibilă pentru analiză (de obicei "front")
    let imageUrl = null;
    if (photos.front) {
      imageUrl = photos.front;
    } else if (photos.side) {
      imageUrl = photos.side;
    } else {
      imageUrl = Object.values(photos)[0]; // Luăm prima imagine din orice cameră
    }
    
    if (!imageUrl) {
      console.log('Error: No valid image URL found in request');
      return res.status(400).json({ error: 'No valid image provided' });
    }
    
    console.log('Calling OpenAI API for skin analysis...');
    
    // Apelăm OpenAI API pentru analiză
    const openAIResponse = await analyzeImageWithOpenAI(imageUrl);
    
    console.log('OpenAI response received');
    console.log('Sending analysis response');
    res.json({ result: openAIResponse });
    
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Funcție pentru a analiza imaginea cu OpenAI
async function analyzeImageWithOpenAI(imageBase64) {
  try {
    // Verificăm dacă avem o cheie API validă
    if (!OPENAI_API_KEY || OPENAI_API_KEY === "sk-your-key-here") {
      console.log('Warning: Using mock response because no valid OpenAI API key is provided');
      return getMockAnalysisResponse();
    }
    
    // Pregătim datele pentru API-ul OpenAI
    const payload = {
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: "Ești un expert dermatolog. Analizează fotografia pielii și oferă o evaluare detaliată în limba română despre starea pielii, posibile probleme și recomandări de îngrijire. Structurează răspunsul în două secțiuni: analiza pielii și recomandări."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analizează această imagine a feței mele și spune-mi starea pielii mele, ce probleme ai detectat și ce recomandări de îngrijire a pielii îmi sugerezi."
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64
              }
            }
          ]
        }
      ],
      max_tokens: 800
    };
    
    // Facem cererea către API-ul OpenAI
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );
    
    // Extragem și returnăm analiza
    if (response.data && 
        response.data.choices && 
        response.data.choices.length > 0 && 
        response.data.choices[0].message &&
        response.data.choices[0].message.content) {
      return response.data.choices[0].message.content;
    } else {
      console.log('Unexpected OpenAI API response format:', JSON.stringify(response.data));
      return 'Nu am putut analiza corect imaginea. Vă rugăm încercați din nou.';
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error.response?.data || error.message);
    
    // În caz de eroare, returnăm un răspuns simulat
    console.log('Returning mock analysis due to API error');
    return getMockAnalysisResponse();
  }
}

// Funcție pentru a returna un răspuns simulat în caz de eroare
function getMockAnalysisResponse() {
  return `Analiză piele:

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
}

// Start the server
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
  console.log(`App is running at: http://localhost:${port}`);
  console.log("Available endpoints:");
  console.log("- GET /      - Root endpoint");
  console.log("- GET /ping  - Test connection endpoint");
  console.log("- POST /analyze-skin - Skin analysis endpoint");
});
