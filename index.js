const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const supplierapp = require('./services/supplier');

const app = express();

// ✅ CORS config FIRST
app.use(cors({
  origin: ['https://supplier-mangement.azurewebsites.net'], // add your frontend origin
  credentials: true
}));

// ✅ Handle preflight requests explicitly
app.options('*', (req, res) => { 
  res.header('Access-Control-Allow-Origin', 'https://supplier-mangement.azurewebsites.net');    
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// ✅ Body parsers - MUST be before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory:', uploadsDir);
}

// ✅ Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));
console.log('✅ Serving static files from:', uploadsDir);

// ✅ Routes - supplier.js handles all /ajouter/* routes including certificates
app.use('/ajouter', supplierapp);

// ✅ Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    uploadsDir: uploadsDir,
    uploadsDirExists: fs.existsSync(uploadsDir)
  });
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Uploads directory: ${uploadsDir}`);
});
