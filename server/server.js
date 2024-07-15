
import express from "express";
import session from 'express-session';
import bodyParser from "body-parser";
import cors from "cors";
import fetch from 'node-fetch';

import path from "path"
import { fileURLToPath } from 'url';
import multer from 'multer';

import { appConfig } from "./config/appConfig.js";
import { uploadImageToCloudinary } from './controllers/cloudinaryUpload.js'; // Import the upload function
//import { aiConfig } from "./config/aiConfig.js";
import { aiController } from "./controllers/aiController.js";


// Set EJS as the templating engine

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicPath = path.join(__dirname, 'public');

const app = express();
app.set('view engine', 'ejs');

// Determine if the application is running in production
const isProduction = process.env.NODE_ENV === 'production';

// Set up session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: isProduction, // Set secure cookies in production
    maxAge: 60000 // Example cookie expiration time (1 minute)
  }
}));


// Middleware to check if the user is logged in
const checkLogin = (req, res, next) => {
  if (req.session.LoginActive) {
    return next();
  }
  res.redirect('/login');
};

// Middleware to check for 'LoginActive' session key
app.use((req, res, next) => {
  if (req.session.LoginActive) {
    return res.redirect('/dashboard');
  }
  next();
});

// Multer storage configuration (adjust as needed)
const storage = multer.diskStorage({});
const upload = multer({ storage: storage, limits: { fileSize: 5000000 } });


// Configure Multer for file uploads
const storage_for_upload = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/public/User_Content/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const file_uploader = multer({ storage: storage_for_upload, limits: { fileSize: 5000000 } });




app.use(express.static(publicPath));
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

// Handle GET request for the /login route
app.get('/login', (req, res) => {
  //res.sendFile("/login.html", { root: __dirname });
  const result = { Result: null };
  res.render('login', { result });

});

// Another route that should trigger the redirect if logged in
app.get('/dashboard', checkLogin, (req, res) => {
  const Authenticated_User = req.session.LoginActive;
  res.render('dashboard', { Authenticated_User });
});


// Route to handle file upload
app.post('/login', file_uploader.single('image_psd'), async (req, res) => {
  const email = req.body.email;
  const image = req.file;

  const result = { Result: 'error', message: "Login Failed: Invalid Details" };// default values

  const Path = `/User_Content/${image.filename}`
  const fullUrl = req.protocol + '://' + req.get('host') + Path;



  try {
    const externalUrl = 'https://meruprastaar.com/api/Users_Data/user_authentication/authenticator';
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email, password: fullUrl }),
    };

    // Fetch data from external website
    const response = await fetch(externalUrl, options);
    if (!response.ok) {
      throw new Error(`Login failed`);
    }
    const data = await response.json();

    result.Result = 'success';
    result.message = data.message;
    req.session.LoginActive = { email: data.Authenticated_User.email, name: data.Authenticated_User.name };
    res.render('login', { result });
  }
  catch (error) {
    //console.error('Login Failed:');
    //res.status(500).json({ error: 'Image upload failed' });
    res.render('login', { result });
  }
});


// Handle GET request for the /signup route
app.get('/signup', (req, res) => {
  //res.sendFile("/login.html", { root: __dirname });
  const result = { Result: null };
  res.render('signup', { result });
});

// Handle form data , before /login
app.post('/signup', upload.single('image_psd'), async (req, res) => {
  const { name, email } = req.body;
  const image = req.file; // Uploaded image file
  const result = { Result: 'error', message: "Registration Failed" };
  try {
    const cloudinaryResponse = await uploadImageToCloudinary(image, email);
    // Process the data, save to database, etc.
    //console.log(name, email, cloudinaryResponse);
    // Send the Cloudinary response to the client
    //res.json({ message: 'Data received successfully', cloudinaryResponse });

    const externalUrl = 'https://meruprastaar.com/api/Users_Data/create/store';
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Name: name, Email: email, Password: cloudinaryResponse.secure_url }),
    };

    // Fetch data from external website
    const response = await fetch(externalUrl, options);
    const data = await response.json();

    // Send the fetched data as the response
    //res.json(data);

    //res.sendFile("/login.html", { root: __dirname });
    result.Result = 'success';
    result.message = 'Registration Success';
    res.render('signup', { result });

  } catch (error) {
    console.error('Error creating account:', error);
    //res.status(500).json({ error: 'Image upload failed' });
    res.render('signup', { result });
  }
});

// Get Gemini API Response
app.post("/test", aiController);

// App listening
app.listen(PORT, () => {
  //console.log(PORT)
  console.log("Gemini AI Server is listening on port number", PORT);
});
