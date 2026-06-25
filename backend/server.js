require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore();

const app = express();
app.use(cors());
app.use(express.json());

const gamificationService = require('./services/gamification');

// Endpoints
app.get('/api/users/:id', async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(doc.data());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/visits', async (req, res) => {
  try {
    const { userId } = req.body;
    const userRef = db.collection('users').doc(userId);
    const doc = await userRef.get();
    
    let user;
    if (!doc.exists) {
      // First visit / user creation default values
      user = {
        id: userId,
        name: "Usuario",
        phone: "",
        xp: 0,
        coins: 0,
        visits: 0,
        badges: []
      };
    } else {
      user = doc.data();
    }

    // Process visit through gamification logic
    const updatedUser = gamificationService.processVisit(user);
    
    // Save to Firestore
    await userRef.set(updatedUser, { merge: true });

    res.json({
      message: "Visita registrada exitosamente",
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
