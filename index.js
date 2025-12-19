const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
    

const supplierapp = require('./services/supplier');

const app = express();
// Middleware
// ✅ MUST be before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
   
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

//file type 
// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, './uploads');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'certificate-' + uniqueSuffix + ext);
  }
});

// File filter for allowed types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, PNG, and Word documents are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});


// 🆕 Create new certificate WITH file upload
app.post('/api/certificates', upload.single('file'), async (req, res) => {
  try {
    console.log('📥 Creating certificate request received');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    // For FormData, req.body fields are available as strings
    const { unit_id, Type, Date } = req.body;
    const file = req.file;
    
    // Log the incoming data
    console.log('Parsed data:', { unit_id, Type, Date, file: file?.filename });

    if (!unit_id || !Type || !Date) {
      console.log('Missing required fields:', { unit_id, Type, Date });
      // Delete uploaded file if validation fails
      if (file) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({ 
        error: 'Unit ID, type, and date are required',
        received: { unit_id, Type, Date }
      });
    }

    const query = `
      INSERT INTO certificat (unit_id, "Type", "Date", file)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    // Use relative path for database
    const filePath = file ? `/uploads/${file.filename}` : null;
    console.log('File path to save:', filePath);
    
    const result = await db.query(query, [unit_id, Type, Date, filePath]);
    
    const certificate = result.rows[0];
    
    // Return full file URL for frontend
    certificate.file_url = filePath ? `http://localhost:5000${filePath}` : null;
    
    console.log('✅ Certificate created:', certificate);
    res.status(201).json(certificate);
  } catch (error) {
    console.error('❌ Error creating certificate:', error);
    
    // Clean up file if upload fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// 🆕 Update certificate WITH file upload
// 🆕 Update certificate WITH file upload
app.put('/api/certificates/:id', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 Updating certificate:', { id });
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    // For FormData, req.body fields are available as strings
    const { Type, Date, keepExistingFile } = req.body;
    const file = req.file;

    if (!Type || !Date) {
      console.log('Missing required fields:', { Type, Date });
      // Delete uploaded file if validation fails
      if (file) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({ 
        error: 'Type and date are required',
        received: { Type, Date }
      });
    }

    // First, get the current certificate to check if it has a file
    const currentCertQuery = await db.query(
      'SELECT file FROM certificat WHERE certificat_id = $1',
      [id]
    );

    if (currentCertQuery.rows.length === 0) {
      if (file) {
        fs.unlinkSync(file.path);
      }
      return res.status(404).json({ error: 'Certificate not found' });
    }

    let filePath = currentCertQuery.rows[0].file; // Keep existing file by default
    
    if (file) {
      // New file uploaded
      filePath = `/uploads/${file.filename}`;
      
      // Delete old file if exists
      if (currentCertQuery.rows[0]?.file) {
        const oldFilePath = path.join(__dirname, '..', currentCertQuery.rows[0].file);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
    } else if (keepExistingFile !== 'true') {
      // If keepExistingFile is not explicitly true, remove the file
      if (currentCertQuery.rows[0]?.file) {
        const oldFilePath = path.join(__dirname, '..', currentCertQuery.rows[0].file);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      filePath = null;
    }

    const query = `
      UPDATE certificat
      SET "Type" = $1, "Date" = $2, file = $3
      WHERE certificat_id = $4
      RETURNING *
    `;
    
    const result = await db.query(query, [Type, Date, filePath, id]);
    
    const certificate = result.rows[0];
    certificate.file_url = filePath ? `http://localhost:5000${filePath}` : null;
    
    console.log('✅ Certificate updated:', certificate);
    res.json(certificate);
  } catch (error) {
    console.error('❌ Error updating certificate:', error);
    
    // Clean up file if upload fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// 🆕 Delete certificate (also delete associated file)
app.delete('/api/certificates/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // First, get the certificate to check for file
    const certQuery = await db.query(
      'SELECT file FROM certificat WHERE certificat_id = $1',
      [id]
    );

    if (certQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Delete the associated file if it exists
    if (certQuery.rows[0].file) {
      const filePath = path.join(__dirname, '..', certQuery.rows[0].file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete the certificate from database
    const result = await db.query(
      'DELETE FROM certificat WHERE certificat_id = $1 RETURNING *',
      [id]
    );

    res.json({
      message: 'Certificate deleted successfully',
      deletedCertificate: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🆕 Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 🆕 Get certificate file (for preview/download)
app.get('/api/certificates/:id/file', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = await db.query(
      'SELECT file FROM certificat WHERE certificat_id = $1',
      [id]
    );
    
    if (query.rows.length === 0 || !query.rows[0].file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const filePath = path.join(__dirname, '..', query.rows[0].file);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }
    
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error fetching certificate file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/ajouter', supplierapp);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});