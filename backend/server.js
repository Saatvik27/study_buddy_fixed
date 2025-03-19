const express = require('express');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const axios = require('axios');  // Added axios for making HTTP requests

dotenv.config();

const serviceAccount = require('../studybuddy-681c2-firebase-adminsdk-fbsvc-d5c7bd9100.json'); // Update the path if needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();

app.use(cors({
    origin: 'http://localhost:3000', // Replace with your frontend URL if needed
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json());

// Middleware to verify Firebase ID token
const verifyIdToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const idToken = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token Verification Error:', error);
    res.status(401).json({ message: 'Unauthorized', error: error.message });
  }
};


const port = 5000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
