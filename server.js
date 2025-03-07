require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');
const authRoutes = require('./routes/auth');
const feedbackRoutes = require('./routes/feedback');
const path = require('path');
const fs = require('fs'); // Add this to check file existence
// app.use('/uploads', express.static('uploads'));
const app = express();
let port = process.env.PORT || 3000;

// Initialize Firebase Admin SDK
const serviceAccountPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT);
console.log('Attempting to load Firebase service account from:', serviceAccountPath);

if (!fs.existsSync(serviceAccountPath)) {
    console.error('Service account file does not exist at:', serviceAccountPath);
    process.exit(1);
}
if (fs.statSync(serviceAccountPath).isDirectory()) {
    console.error('Service account path is a directory, not a file:', serviceAccountPath);
    process.exit(1);
}

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
    });
    console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', { message: error.message, stack: error.stack });
    process.exit(1);
}

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
}).then(() => {
    console.log('MongoDB connected successfully to:', process.env.MONGODB_URI);
    app.use('/auth', authRoutes);
    app.use('/feedback', feedbackRoutes);
    startServer(port);
}).catch(err => {
    console.log('MongoDB connection failed:', { message: err.message, stack: err.stack });
    process.exit(1);
});

function startServer(port) {
    // Convert port to a number to ensure proper addition
    port = Number(port);
    
    // Check if port is valid
    if (port >= 65536) {
        console.error('No available ports found under 65536');
        process.exit(1);
    }
    
    app.listen(port, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is in use, trying ${port + 1}`);
            startServer(port + 1);
        } else {
            console.log('Server error:', { message: err.message, stack: err.stack });
        }
    });
}