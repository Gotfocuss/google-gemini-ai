
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import { appConfig } from "./config/appConfig.js";
import { aiConfig } from "./config/aiConfig.js";
import { aiController } from "./controllers/aiController.js";

const app = express();
app.use(
  cors({
    origin: appConfig.corsConfig.origin,
    methods: appConfig.corsConfig.methods,
    allowedHeaders: ["Content-Type", "application/json"],
  })
);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = process.env.PORT;
const ASKk = process.env.GEMINI_API_KEY;

// Get Gemini API Response
app.post("/chat-with-gemini", aiController);

// App listening
app.listen(PORT, () => {
  //console.log(PORT)
  console.log("Gemini AI Server is listening on port number", PORT);
});
