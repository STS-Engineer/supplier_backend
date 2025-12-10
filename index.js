const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

    

const supplierrouter = require('./services/supplier');

const app = express();

   
// ✅ CORS config FIRST
app.use(cors({
  origin: ['http://localhost:3000'], // add your frontend origin
  credentials: true
}));

// ✅ Handle preflight requests explicitly
app.options(/.*/, (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});


// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());

// Routes
app.use('/ajouter', supplierrouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});