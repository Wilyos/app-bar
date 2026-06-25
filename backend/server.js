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

// Register a new user manually
app.post('/api/users/register', async (req, res) => {
  try {
    const { userId, name, phone } = req.body;
    
    if (!userId || !name) {
      return res.status(400).json({ error: "Faltan datos requeridos (userId, name)" });
    }
    
    const userRef = db.collection('users').doc(userId);
    const doc = await userRef.get();
    
    if (doc.exists) {
      return res.status(400).json({ error: "El usuario ya existe." });
    }
    
    const newUser = {
      id: userId,
      name: name,
      phone: phone || "",
      xp: 0,
      coins: 0,
      visits: 0,
      badges: []
    };
    
    await userRef.set(newUser);
    
    res.json({
      message: "Usuario registrado exitosamente",
      user: newUser
    });
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

// QR Generation Endpoint (Called by Admin/Waiter)
// QR Generation for Promos
app.post('/api/qr/generate/promo', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: "El título es requerido" });
    }
    
    const qrRef = await db.collection('qr_codes').add({
      type: 'promo',
      title: title,
      description: description || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    
    res.json({
      qrId: qrRef.id,
      message: "QR de promoción generado exitosamente"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// QR Generation Endpoint (Called by Admin/Waiter)
app.post('/api/qr/generate', async (req, res) => {
  try {
    const { xp, coins } = req.body;
    
    if (!xp || !coins) {
      return res.status(400).json({ error: "Se requieren XP y monedas" });
    }
    
    // Create a new QR code document in Firestore
    const qrRef = await db.collection('qr_codes').add({
      type: 'points',
      xp: Number(xp),
      coins: Number(coins),
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    
    res.json({
      qrId: qrRef.id,
      message: "QR generado exitosamente"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// QR Claim Endpoint (Called by Customer Scanner)
app.post('/api/qr/claim', async (req, res) => {
  try {
    const { qrId, userId } = req.body;
    
    if (!qrId || !userId) {
      return res.status(400).json({ error: "Faltan datos requeridos (qrId o userId)" });
    }
    
    // Transaction to ensure atomic operation (prevent double claiming)
    const result = await db.runTransaction(async (t) => {
      const qrRef = db.collection('qr_codes').doc(qrId);
      const qrDoc = await t.get(qrRef);
      
      if (!qrDoc.exists) {
        throw new Error("Código QR no encontrado en el sistema.");
      }
      
      const qrData = qrDoc.data();
      if (qrData.status !== 'pending') {
        throw new Error("Este código QR ya fue utilizado.");
      }
      
      // Get User FIRST
      const userRef = db.collection('users').doc(userId);
      const userDoc = await t.get(userRef);
      
      let user;
      if (!userDoc.exists) {
        throw new Error("El usuario no existe. Por favor completa tu registro primero.");
      } else {
        user = userDoc.data();
      }
      
      // Update QR status so it can't be used again
      t.update(qrRef, { status: 'used', usedBy: userId, usedAt: new Date().toISOString() });
      
      let updatedUser = { ...user };

      if (qrData.type === 'promo') {
        // Handle Promo Claim
        const newPromo = {
          id: qrId, // using qrId as unique identifier for this promo
          title: qrData.title,
          description: qrData.description,
          status: 'active',
          claimedAt: new Date().toISOString()
        };
        updatedUser.promos = [...(user.promos || []), newPromo];
      } else {
        // Handle Points Claim
        updatedUser.xp = (user.xp || 0) + (qrData.xp || 0);
        updatedUser.coins = (user.coins || 0) + (qrData.coins || 0);
        updatedUser.visits = (user.visits || 0) + 1;
        // Process gamification badges (leveling up)
        updatedUser = gamificationService.processVisit(updatedUser);
      }
      
      // Save updated user to Firestore
      t.set(userRef, updatedUser, { merge: true });
      
      return { user: updatedUser, isPromo: qrData.type === 'promo' };
    });
    
    res.json({
      message: result.isPromo ? "¡Promoción agregada a tus cartas!" : "¡Experiencia y monedas reclamadas con éxito!",
      user: result.user
    });
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Redeem Promo Endpoint
app.post('/api/users/promos/redeem', async (req, res) => {
  try {
    const { userId, promoId } = req.body;
    
    if (!userId || !promoId) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }
    
    const result = await db.runTransaction(async (t) => {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await t.get(userRef);
      
      if (!userDoc.exists) throw new Error("Usuario no encontrado");
      
      const user = userDoc.data();
      const promos = user.promos || [];
      const promoIndex = promos.findIndex(p => p.id === promoId && p.status === 'active');
      
      if (promoIndex === -1) {
        throw new Error("La promoción no existe o ya fue utilizada");
      }
      
      // Mark as used
      promos[promoIndex].status = 'used';
      promos[promoIndex].usedAt = new Date().toISOString();
      
      t.update(userRef, { promos });
      return promos;
    });
    
    res.json({ message: "¡Promoción validada correctamente!", promos: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
