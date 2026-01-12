// routes/supplier.js
const express = require('express');
const router = express.Router();
const db = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

//file type 
// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads')

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


// Configure multer for plants file uploads
const plantsStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'plants');

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
    cb(null, 'plant-agreement-' + uniqueSuffix + ext);
  }
});

const plantsUpload = multer({
  storage: plantsStorage,
  fileFilter: fileFilter, // Reuse the same file filter
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Get all groups with their units (existing)
router.get('/api/groups', async (req, res) => {
  try {
    const query = `
      SELECT 
        g.supplier_id,
        g.supplier_name,
        g.responsible_group,
        g.description,
        u.unit_id,
        u.unit_name,
        u.city,
        u.country,
        u.zone_name,
        -- Account Information
        u.account_name,
        u.parent_account,
        u.key_account,
        u.ke_account_manager,
        u.avo_carbon_main_contact,
        u.avo_carbon_tech_lead,
        u.type,
        u.industry,
        u.account_owner,
        u.phone,
        u.website,
        u.employees,
        u.useful_information,
        u.billing_account_number,
        u.product_family,
        u.account_currency,
        -- Company Information
        u.start_year,
        u.solvent_customer,
        u.solvency_info,
        u.budget_avo_carbon,
        u.avo_carbon_potential_buisness,
        -- Address Information
        u.billing_address_search,
        u.billing_street,
        u.billing_city,
        u.billing_state,
        u.billing_zip,
        u.billing_country,
        u.shippping_address_search,
        u.shipping_street,
        u.shipping_city,
        u.shipping_state,
        u.shipping_zip,
        u.shipping_country,
        u.copy_billing,
        -- Agreements
        u.confidentiality_agreement,
        u.quality_agreement,
        u.terms_purshase,
        u.logistics_agreement,
        u.document_file,
        -- Responsible Person
        p."Person_id",
        p.first_name,
        p.last_name,
        p.job_title,
        p.email,
        p.phone_number,
        p.role
      FROM supplier g
      LEFT JOIN unit u ON g.supplier_id = u.supplier_id
      LEFT JOIN "Person" p ON u.com_person_id = p."Person_id"
      ORDER BY g.supplier_name, u.unit_name
    `;

    const result = await db.query(query);

    const groups = {};
    result.rows.forEach(row => {
      if (!groups[row.supplier_id]) {
        groups[row.supplier_id] = {
          supplier_id: row.supplier_id,
          supplier_name: row.supplier_name,
          responsible_group: row.responsible_group,
          description: row.description,
          units: []
        };
      }

      if (row.unit_id) {
        groups[row.supplier_id].units.push({
          unit_id: row.unit_id,
          unit_name: row.unit_name,
          city: row.city,
          country: row.country,
          zone_name: row.zone_name,
          // Account Information
          account_name: row.account_name,
          parent_account: row.parent_account,
          key_account: row.key_account,
          ke_account_manager: row.ke_account_manager,
          avo_carbon_main_contact: row.avo_carbon_main_contact,
          avo_carbon_tech_lead: row.avo_carbon_tech_lead,
          type: row.type,
          industry: row.industry,
          account_owner: row.account_owner,
          phone: row.phone,
          website: row.website,
          employees: row.employees,
          useful_information: row.useful_information,
          billing_account_number: row.billing_account_number,
          product_family: row.product_family,
          account_currency: row.account_currency,
          // Company Information
          start_year: row.start_year,
          solvent_customer: row.solvent_customer,
          solvency_info: row.solvency_info,
          budget_avo_carbon: row.budget_avo_carbon,
          avo_carbon_potential_buisness: row.avo_carbon_potential_buisness,
          // Address Information
          billing_address_search: row.billing_address_search,
          billing_street: row.billing_street,
          billing_city: row.billing_city,
          billing_state: row.billing_state,
          billing_zip: row.billing_zip,
          billing_country: row.billing_country,
          shippping_address_search: row.shippping_address_search,
          shipping_street: row.shipping_street,
          shipping_city: row.shipping_city,
          shipping_state: row.shipping_state,
          shipping_zip: row.shipping_zip,
          shipping_country: row.shipping_country,
          copy_billing: row.copy_billing,
          // Agreements
          confidentiality_agreement: row.confidentiality_agreement,
          quality_agreement: row.quality_agreement,
          terms_purshase: row.terms_purshase,
          logistics_agreement: row.logistics_agreement,
          document_file: row.document_file,
          // Responsible Person
          responsible: row.Person_id ? {
            Person_id: row.Person_id,
            first_name: row.first_name,
            last_name: row.last_name,
            job_title: row.job_title,
            email: row.email,
            phone_number: row.phone_number,
            role: row.role
          } : null
        });
      }
    });

    res.json(Object.values(groups));
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





// Get unit details by ID (existing)
// Update the existing /api/units/:id endpoint
router.get('/api/units/:id', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.*,
        g.supplier_name,
        g.responsible_group,
        p."Person_id",
        p.first_name,
        p.last_name,
        p.job_title,
        p.email,
        p.phone_number,
        p.role,
        p.zone_name as person_zone_name
      FROM unit u
      LEFT JOIN supplier g ON u.supplier_id = g.supplier_id
      LEFT JOIN "Person" p ON u.com_person_id = p."Person_id"
      WHERE u.unit_id = $1
    `;

    const result = await db.query(query, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    const unit = result.rows[0];

    // Fetch plants for this unit
    const plantsQuery = `
      SELECT 
        plant_id,
        plant,
        "Acheteur_avo",
        alias,
        top,
        incoterms,
        "place of incoterms" as place_of_incoterms,
        fichier_accord,
        unit_id
      FROM plants 
      WHERE unit_id = $1
      ORDER BY plant
    `;

    const plantsResult = await db.query(plantsQuery, [req.params.id]);

    const unitDetails = {
      unit_id: unit.unit_id,
      unit_name: unit.unit_name,
      supplier_name: unit.supplier_name,
      responsible_group: unit.responsible_group,
      city: unit.city,
      country: unit.country,
      zone_name: unit.zone_name,
      // Account Information
      account_name: unit.account_name,
      parent_account: unit.parent_account,
      key_account: unit.key_account,
      ke_account_manager: unit.ke_account_manager,
      avo_carbon_main_contact: unit.avo_carbon_main_contact,
      avo_carbon_tech_lead: unit.avo_carbon_tech_lead,
      type: unit.type,
      industry: unit.industry,
      account_owner: unit.account_owner,
      phone: unit.phone,
      website: unit.website,
      employees: unit.employees,
      useful_information: unit.useful_information,
      billing_account_number: unit.billing_account_number,
      product_family: unit.product_family,
      account_currency: unit.account_currency,
      // Company Information
      start_year: unit.start_year,
      solvent_customer: unit.solvent_customer,
      solvency_info: unit.solvency_info,
      budget_avo_carbon: unit.budget_avo_carbon,
      avo_carbon_potential_buisness: unit.avo_carbon_potential_buisness,
      // Address Information
      billing_address_search: unit.billing_address_search,
      billing_street: unit.billing_street,
      billing_city: unit.billing_city,
      billing_state: unit.billing_state,
      billing_zip: unit.billing_zip,
      billing_country: unit.billing_country,
      shippping_address_search: unit.shippping_address_search,
      shipping_street: unit.shipping_street,
      shipping_city: unit.shipping_city,
      shipping_state: unit.shipping_state,
      shipping_zip: unit.shipping_zip,
      shipping_country: unit.shipping_country,
      copy_billing: unit.copy_billing,
      // Agreements
      confidentiality_agreement: unit.confidentiality_agreement,
      quality_agreement: unit.quality_agreement,
      terms_purshase: unit.terms_purshase,
      logistics_agreement: unit.logistics_agreement,
      document_file: unit.document_file,
      // Plants from separate table
      plants: plantsResult.rows,
      // Responsible Person
      responsible: unit.Person_id ? {
        Person_id: unit.Person_id,
        first_name: unit.first_name,
        last_name: unit.last_name,
        job_title: unit.job_title,
        email: unit.email,
        phone_number: unit.phone_number,
        role: unit.role,
        zone_name: unit.person_zone_name
      } : null
    };

    res.json(unitDetails);
  } catch (error) {
    console.error('Error fetching unit details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🆕 Create new group
router.post('/api/groups', async (req, res) => {
  try {
    const { supplier_name, responsible_group , description } = req.body;

    if (!supplier_name) {
      return res.status(400).json({ error: 'Supplier name is required' });
    }

    const query = `
      INSERT INTO supplier (supplier_name,responsible_group, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const result = await db.query(query, [supplier_name,responsible_group, description || null]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🆕 Update group
router.put('/api/groups/:id', async (req, res) => {
  try {
    const { supplier_name,responsible_group, description } = req.body;
    const { id } = req.params;

    if (!supplier_name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const query = `
      UPDATE supplier
      SET supplier_name = $1 , responsible_group = $2, description = $3
      WHERE supplier_id = $4
      RETURNING *
    `;

    const result = await db.query(query, [supplier_name, responsible_group, description || null, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🆕 Delete group
router.delete('/api/groups/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM supplier WHERE supplier_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({
      message: 'Group, units, and plants deleted successfully',
      deletedGroup: result.rows[0],
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Add this to your backend routes/customers.js

// 🆕 Get persons by email domain
router.get('/api/persons/by-domain', async (req, res) => {
  try {
    const { domain } = req.query;

    if (!domain) {
      return res.status(400).json({ error: 'Domain parameter is required' });
    }

    const query = `
      SELECT 
        "Person_id",
        first_name,
        last_name,
        job_title,
        email,
        phone_number,
        role,
        zone_name
      FROM "Person" 
      WHERE email LIKE $1
      ORDER BY first_name, last_name
    `;

    const result = await db.query(query, [`%@${domain}`]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching persons by domain:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🆕 Get person by ID
router.get('/api/persons/:id', async (req, res) => {
  try {
    const query = `
      SELECT 
        "Person_id",
        first_name,
        last_name,
        job_title,
        email,
        phone_number,
        role,
        zone_name
      FROM "Person" 
      WHERE "Person_id" = $1
    `;

    const result = await db.query(query, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching person:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Keep your existing endpoint, no changes needed
router.get('/api/persons/by-domain', async (req, res) => {
  try {
    const { domain } = req.query;

    if (!domain) {
      return res.status(400).json({ error: 'Domain parameter is required' });
    }

    const query = `
      SELECT 
        "Person_id",
        first_name,
        last_name,
        job_title,
        email,
        phone_number,
        role,
        zone_name
      FROM "Person" 
      WHERE email LIKE $1
      ORDER BY first_name, last_name
    `;

    const result = await db.query(query, [`%@${domain}`]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching persons by domain:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🆕 Create new unit
router.post('/api/units', async (req, res) => {
  try {
    const {
      supplier_id, unit_name, city, country, com_person_id, zone_name,
      account_name, parent_account, key_account, ke_account_manager,
      avo_carbon_main_contact, avo_carbon_tech_lead, type, industry,
      account_owner, phone, website, employees, useful_information,
      billing_account_number, product_family, account_currency, start_year,
      solvent_customer, solvency_info, budget_avo_carbon,
      avo_carbon_potential_buisness, billing_address_search, billing_street,
      billing_city, billing_state, billing_zip, billing_country,
      shippping_address_search, shipping_street, shipping_city,
      shipping_state, shipping_zip, shipping_country, copy_billing,
      confidentiality_agreement, quality_agreement, terms_purshase,
      logistics_agreement,
      document_file
    } = req.body;

    // Required fields check
    if (!supplier_id || !unit_name) {
      return res.status(400).json({ error: 'Supplier ID and unit name are required' });
    }

    const query = `
      INSERT INTO unit (
        supplier_id, unit_name, city, country, com_person_id, zone_name,
        account_name, parent_account, key_account, ke_account_manager,
        avo_carbon_main_contact, avo_carbon_tech_lead, type, industry,
        account_owner, phone, website, employees, useful_information,
        billing_account_number, product_family, account_currency, start_year,
        solvent_customer, solvency_info, budget_avo_carbon,
        avo_carbon_potential_buisness, billing_address_search, billing_street,
        billing_city, billing_state, billing_zip, billing_country,
        shippping_address_search, shipping_street, shipping_city,
        shipping_state, shipping_zip, shipping_country, copy_billing,
        confidentiality_agreement, quality_agreement, terms_purshase,
        logistics_agreement, document_file
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19,
        $20, $21, $22, $23, $24, $25, $26, $27, $28,
        $29, $30, $31, $32, $33, $34, $35, $36, $37,
        $38, $39, $40, $41, $42, $43, $44, $45
       
      )
      RETURNING *;
    `;

    const values = [
      supplier_id, unit_name, city || null, country || null, com_person_id || null, zone_name || null,
      account_name || null, parent_account || null,
      // Convert to boolean
      key_account ? (key_account === 'true' || key_account === true) : false,
      ke_account_manager || null,
      avo_carbon_main_contact || null, avo_carbon_tech_lead || null, type || null, industry || null,
      account_owner || null, phone || null, website || null, employees || null, useful_information || null,
      billing_account_number || null, product_family || null, account_currency || null, start_year || null,
      solvent_customer || null, solvency_info || null, budget_avo_carbon || null,
      avo_carbon_potential_buisness || null, billing_address_search || null, billing_street || null,
      billing_city || null, billing_state || null, billing_zip || null, billing_country || null,
      shippping_address_search || null, shipping_street || null, shipping_city || null,
      shipping_state || null, shipping_zip || null, shipping_country || null,
      // Convert to boolean
      copy_billing ? (copy_billing === 'true' || copy_billing === true) : false,
      // Convert to boolean
      confidentiality_agreement ? (confidentiality_agreement === 'true' || confidentiality_agreement === true) : false,
      // Convert to boolean
      quality_agreement ? (quality_agreement === 'true' || quality_agreement === true) : false,
      // Convert to boolean
      terms_purshase ? (terms_purshase === 'true' || terms_purshase === true) : false,
      // Convert to boolean
      logistics_agreement ? (logistics_agreement === 'true' || logistics_agreement === true) : false,
      document_file || null,
     
    ];

    const result = await db.query(query, values);
    console.log('Unit created successfully:', result.rows[0]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating unit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// 🆕 Update unit
router.put('/api/units/:id', async (req, res) => {
  try {
    const unitId = req.params.id;
    const {
      supplier_id, unit_name, city, country, com_person_id, zone_name,
      account_name, parent_account, key_account, ke_account_manager,
      avo_carbon_main_contact, avo_carbon_tech_lead, type, industry,
      account_owner, phone, website, employees, useful_information,
      billing_account_number, product_family, account_currency, start_year,
      solvent_customer, solvency_info, budget_avo_carbon,
      avo_carbon_potential_buisness, billing_address_search, billing_street,
      billing_city, billing_state, billing_zip, billing_country,
      shippping_address_search, shipping_street, shipping_city,
      shipping_state, shipping_zip, shipping_country, copy_billing,
      confidentiality_agreement, quality_agreement, terms_purshase,
      logistics_agreement,
      document_file
    } = req.body;

    const query = `
      UPDATE unit 
      SET 
        supplier_id = $1, unit_name = $2, city = $3, country = $4, 
        com_person_id = $5, zone_name = $6, account_name = $7, 
        parent_account = $8, key_account = $9, ke_account_manager = $10,
        avo_carbon_main_contact = $11, avo_carbon_tech_lead = $12, 
        type = $13, industry = $14, account_owner = $15, phone = $16, 
        website = $17, employees = $18, useful_information = $19,
        billing_account_number = $20, product_family = $21, 
        account_currency = $22, start_year = $23, solvent_customer = $24, 
        solvency_info = $25, budget_avo_carbon = $26,
        avo_carbon_potential_buisness = $27, billing_address_search = $28, 
        billing_street = $29, billing_city = $30, billing_state = $31, 
        billing_zip = $32, billing_country = $33,
        shippping_address_search = $34, shipping_street = $35, 
        shipping_city = $36, shipping_state = $37, shipping_zip = $38, 
        shipping_country = $39, copy_billing = $40,
        confidentiality_agreement = $41, quality_agreement = $42, 
        terms_purshase = $43, logistics_agreement = $44, 
        document_file = $45
      WHERE unit_id = $46
      RETURNING *;
    `;

    const values = [
      supplier_id, unit_name, city || null, country || null, com_person_id || null, zone_name || null,
      account_name || null, parent_account || null,
      key_account ? (key_account === 'true' || key_account === true) : false,
      ke_account_manager || null,
      avo_carbon_main_contact || null, avo_carbon_tech_lead || null, type || null, industry || null,
      account_owner || null, phone || null, website || null, employees || null, useful_information || null,
      billing_account_number || null, product_family || null, account_currency || null, start_year || null,
      solvent_customer || null, solvency_info || null, budget_avo_carbon || null,
      avo_carbon_potential_buisness || null, billing_address_search || null, billing_street || null,
      billing_city || null, billing_state || null, billing_zip || null, billing_country || null,
      shippping_address_search || null, shipping_street || null, shipping_city || null,
      shipping_state || null, shipping_zip || null, shipping_country || null,
      copy_billing ? (copy_billing === 'true' || copy_billing === true) : false,
      confidentiality_agreement ? (confidentiality_agreement === 'true' || confidentiality_agreement === true) : false,
      quality_agreement ? (quality_agreement === 'true' || quality_agreement === true) : false,
      terms_purshase ? (terms_purshase === 'true' || terms_purshase === true) : false,
      logistics_agreement ? (logistics_agreement === 'true' || logistics_agreement === true) : false,
      document_file || null,
      unitId
    ];

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating unit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//certificate management crud 
// 🆕 Get certificates by unit ID
router.get('/api/certificates/by-unit/:unitId', async (req, res) => {
  try {
    const { unitId } = req.params;

    const query = `
      SELECT 
        certificat_id,
        "Type",
        "Date" as validity_date,
        file_url,
        file_name,
        file_size,
        unit_id
      FROM certificat 
      WHERE unit_id = $1
      ORDER BY "Date" DESC
    `;

    const result = await db.query(query, [unitId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🆕 Get all certificates for a supplier (all units)
router.get('/api/certificates/by-supplier/:supplierId', async (req, res) => {
  try {
    const { supplierId } = req.params;

    const query = `
      SELECT 
        c.certificat_id,
        c."Type",
        c."Date" as validity_date,
        c.unit_id,
        u.unit_name,
        u.supplier_id
      FROM certificat c
      JOIN unit u ON c.unit_id = u.unit_id
      WHERE u.supplier_id = $1
      ORDER BY u.unit_name, c."Date" DESC
    `;

    const result = await db.query(query, [supplierId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching supplier certificates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// 🆕 Create new certificate - FIXED
router.post(
  '/api/certificates',
  upload.single('file'),
  async (req, res) => {
    try {
      const { unit_id, Type, Date, custom_type } = req.body || {};
      const file = req.file;

      if (!unit_id || !Type || !Date) {
        if (file) fs.unlinkSync(file.path);
        return res.status(400).json({ error: 'Unit ID, type, and date are required' });
      }

      // ✅ FIXED: Store relative path, not full URL
      const fileUrl = file ? `/uploads/${file.filename}` : null;
      const fileName = file ? file.originalname : null;
      const fileSize = file ? file.size : null;

      const query = `
        INSERT INTO certificat 
          (unit_id, "Type", "Date", file_url, file_name, file_size)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const result = await db.query(query, [
        unit_id,
        Type,
        Date,
        fileUrl,
        fileName,
        fileSize
      ]);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating certificate:', error);
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
);



// 🆕 Update certificate
// 🆕 Update certificate - UPDATED
router.put('/api/certificates/:id', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { Type, Date, custom_type, keepExistingFile } = req.body;
    const file = req.file;

    console.log('📝 Updating certificate:', {
      id, Type, Date, custom_type,
      keepExistingFile,
      hasFile: !!file,
      fileInfo: file ? {
        filename: file.filename,
        originalname: file.originalname,
        size: file.size
      } : null
    });

    if (!Type || !Date) {
      return res.status(400).json({ error: 'Type and date are required' });
    }

    // First, get the current certificate
    const currentCert = await db.query(
      'SELECT file_url, file_name, file_size FROM certificat WHERE certificat_id = $1',
      [id]
    );

    if (currentCert.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    let fileUrl = currentCert.rows[0].file_url;
    let fileName = currentCert.rows[0].file_name;
    let fileSize = currentCert.rows[0].file_size;

    if (file) {
      // New file uploaded - update all file data
      fileUrl = `/uploads/${file.filename}`;
      fileName = file.originalname;
      fileSize = file.size;

      // Delete old file if it exists
      if (currentCert.rows[0]?.file_url) {
        const oldFilePath = path.join(__dirname, '..', currentCert.rows[0].file_url);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
    } else if (keepExistingFile !== 'true') {
      // No file and not keeping existing - clear file data
      fileUrl = null;
      fileName = null;
      fileSize = null;

      // Delete old file if it exists
      if (currentCert.rows[0]?.file_url) {
        const oldFilePath = path.join(__dirname, '..', currentCert.rows[0].file_url);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
    }
    // If keepExistingFile === 'true', keep the current file data

    const query = `
      UPDATE certificat
      SET 
        "Type" = $1, 
        "Date" = $2, 
        file_url = $3, 
        file_name = $4, 
        file_size = $5
      WHERE certificat_id = $6
      RETURNING *
    `;

    const result = await db.query(query, [
      Type,
      Date,
      fileUrl,
      fileName,
      fileSize,
      id
    ]);

    console.log('✅ Certificate updated:', result.rows[0]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error updating certificate:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// 🆕 Delete certificate
router.delete('/api/certificates/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM certificat WHERE certificat_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json({
      message: 'Certificate deleted successfully',
      deletedCertificate: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🆕 Get complete customer data (group with units, responsible persons, and certificates)
// Update the existing complete customer endpoint to include plants
router.get('/api/groups/:id/complete', async (req, res) => {
  try {
    const groupQuery = `
      SELECT * FROM supplier WHERE supplier_id = $1
    `;
    const groupResult = await db.query(groupQuery, [req.params.id]);

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const unitsQuery = `
      SELECT 
        u.*,
        p."Person_id",
        p.first_name,
        p.last_name,
        p.job_title,
        p.email,
        p.phone_number,
        p.role,
        p.zone_name as person_zone_name
      FROM unit u
      LEFT JOIN "Person" p ON u.com_person_id = p."Person_id"
      WHERE u.supplier_id = $1
    `;
    const unitsResult = await db.query(unitsQuery, [req.params.id]);

    // Get plants and certificates for each unit
    const unitsWithAllData = await Promise.all(
      unitsResult.rows.map(async (unit) => {
        // Get certificates for this unit
        const certificatesQuery = `
          SELECT 
            certificat_id,
            "Type",
            "Date" as validity_date,
            file_url,
            file_name,
            file_size,
            unit_id
          FROM certificat 
          WHERE unit_id = $1
          ORDER BY "Date" DESC
        `;
        const certificatesResult = await db.query(certificatesQuery, [unit.unit_id]);

        // Get plants for this unit
        const plantsQuery = `
          SELECT 
            plant_id,
            plant,
            "Acheteur_avo",
            alias,
            top,
            incoterms,
            "place of incoterms" as place_of_incoterms,
            fichier_accord,
            unit_id
          FROM plants 
          WHERE unit_id = $1
          ORDER BY plant
        `;
        const plantsResult = await db.query(plantsQuery, [unit.unit_id]);

        return {
          ...unit,
          certificates: certificatesResult.rows,
          plants: plantsResult.rows
        };
      })
    );

    const customerData = {
      ...groupResult.rows[0],
      units: unitsWithAllData.map(unit => {
        // Create unit object with all fields
        const unitObj = {
          unit_id: unit.unit_id,
          unit_name: unit.unit_name,
          city: unit.city,
          country: unit.country,
          zone_name: unit.zone_name,
          // Account Information
          account_name: unit.account_name,
          parent_account: unit.parent_account,
          key_account: unit.key_account,
          ke_account_manager: unit.ke_account_manager,
          avo_carbon_main_contact: unit.avo_carbon_main_contact,
          avo_carbon_tech_lead: unit.avo_carbon_tech_lead,
          type: unit.type,
          industry: unit.industry,
          account_owner: unit.account_owner,
          phone: unit.phone,
          website: unit.website,
          employees: unit.employees,
          useful_information: unit.useful_information,
          billing_account_number: unit.billing_account_number,
          product_family: unit.product_family,
          account_currency: unit.account_currency,
          // Company Information
          start_year: unit.start_year,
          solvent_customer: unit.solvent_customer,
          solvency_info: unit.solvency_info,
          budget_avo_carbon: unit.budget_avo_carbon,
          avo_carbon_potential_buisness: unit.avo_carbon_potential_buisness,
          // Address Information
          billing_address_search: unit.billing_address_search,
          billing_street: unit.billing_street,
          billing_city: unit.billing_city,
          billing_state: unit.billing_state,
          billing_zip: unit.billing_zip,
          billing_country: unit.billing_country,
          shippping_address_search: unit.shippping_address_search,
          shipping_street: unit.shipping_street,
          shipping_city: unit.shipping_city,
          shipping_state: unit.shipping_state,
          shipping_zip: unit.shipping_zip,
          shipping_country: unit.shipping_country,
          copy_billing: unit.copy_billing,
          // Agreements
          confidentiality_agreement: unit.confidentiality_agreement,
          quality_agreement: unit.quality_agreement,
          terms_purshase: unit.terms_purshase,
          logistics_agreement: unit.logistics_agreement,
          // Additional Information
          document_file: unit.document_file,
          // Responsible Person
          responsible: unit.Person_id ? {
            Person_id: unit.Person_id,
            first_name: unit.first_name,
            last_name: unit.last_name,
            job_title: unit.job_title,
            email: unit.email,
            phone_number: unit.phone_number,
            role: unit.role,
            zone_name: unit.person_zone_name
          } : null,
          // Certificates for this unit
          certificates: (unit.certificates || []).map(cert => ({
            certificat_id: cert.certificat_id,
            Type: cert.Type,
            validity_date: cert.validity_date,
            file_url: cert.file_url,
            file_name: cert.file_name,
            file_size: cert.file_size,
            unit_id: cert.unit_id
          })),
          // Plants for this unit
          plants: (unit.plants || []).map(plant => ({
            plant_id: plant.plant_id,
            plant: plant.plant,
            Acheteur_avo: plant.Acheteur_avo,
            alias: plant.alias,
            top: plant.top,
            incoterms: plant.incoterms,
            place_of_incoterms: plant.place_of_incoterms,
            fichier_accord: plant.fichier_accord,
            unit_id: plant.unit_id
          }))
        };

        return unitObj;
      })
    };

    res.json(customerData);
  } catch (error) {
    console.error('Error fetching complete customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/api/persons', async (req, res) => {
  try {
    const query = `
      SELECT 
        "Person_id",
        first_name,
        last_name,
        job_title,
        email,
        phone_number,
        role,
        zone_name
      FROM "Person" 
      ORDER BY first_name, last_name
    `;

    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching persons:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// ==================== PLANTS TO DELIVER ROUTES ====================

// 🆕 Get all plants for a unit
router.get('/api/plants/by-unit/:unitId', async (req, res) => {
  try {
    const { unitId } = req.params;

    const query = `
      SELECT 
        plant_id,
        plant,
        "Acheteur_avo",
        alias,
        top,
        incoterms,
        "place of incoterms" as place_of_incoterms,
        fichier_accord,
        unit_id
      FROM plants 
      WHERE unit_id = $1
      ORDER BY plant
    `;

    const result = await db.query(query, [unitId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching plants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🆕 Get a specific plant by ID
router.get('/api/plants/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        plant_id,
        plant,
        "Acheteur_avo",
        alias,
        top,
        incoterms,
        "place of incoterms" as place_of_incoterms,
        fichier_accord,
        unit_id
      FROM plants 
      WHERE plant_id = $1
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching plant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🆕 Create new plant
// 🆕 Create new plant
router.post(
  '/api/plants',
  (req, res, next) => {
    console.log('\n=== BEFORE MULTER ===');
    console.log('Headers:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body:', req.body);
    console.log('File:', req.file);
    console.log('===================\n');
    next();
  },
  plantsUpload.single('fichier_accord'),
  (req, res, next) => {
    console.log('\n=== AFTER MULTER ===');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    console.log('Files:', req.files);
    console.log('==================\n');
    next();
  },
  async (req, res) => {
    try {
      console.log('=== PLANT CREATION HANDLER ===');
      console.log('📦 Body:', JSON.stringify(req.body, null, 2));
      console.log('📎 File:', req.file);
      
      const {
        unit_id,
        plant,
        Acheteur_avo,
        alias,
        top,
        incoterms,
        place_of_incoterms
      } = req.body || {};

      const file = req.file;

      if (!unit_id || !plant) {
        console.log('❌ Validation failed');
        if (file) fs.unlinkSync(file.path);
        return res.status(400).json({ error: 'Unit ID and plant name are required' });
      }

      let fichier_accord = null;
      if (file) {
        fichier_accord = `/uploads/plants/${file.filename}`;
        console.log('✅ FILE FOUND:');
        console.log('   Original:', file.originalname);
        console.log('   Saved as:', file.filename);
        console.log('   Path:', file.path);
        console.log('   DB path:', fichier_accord);
        console.log('   Size:', file.size);
      } else {
        console.log('❌ NO FILE RECEIVED BY MULTER');
      }

      const query = `
        INSERT INTO plants 
          (unit_id, plant, "Acheteur_avo", alias, top, incoterms, 
           "place of incoterms", fichier_accord)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const values = [
        unit_id, plant, Acheteur_avo || null, alias || null,
        top || null, incoterms || null, place_of_incoterms || null,
        fichier_accord
      ];

      console.log('💾 SQL Values:', values);

      const result = await db.query(query, values);

      console.log('✅ Result:', result.rows[0]);
      console.log('=== END ===\n');

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('❌ Error:', error);
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
  }
);
// 🆕 Update plant
router.put(
  '/api/plants/:id',
  plantsUpload.single('fichier_accord'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        unit_id,
        plant,
        Acheteur_avo,
        alias,
        top,
        incoterms,
        place_of_incoterms,
        keepExistingFile
      } = req.body || {};

      const file = req.file;

      // Validate required fields
      if (!plant) {
        return res.status(400).json({ error: 'Plant name is required' });
      }

      // First, get the current plant
      const currentPlant = await db.query(
        'SELECT fichier_accord FROM plants WHERE plant_id = $1',
        [id]
      );

      if (currentPlant.rows.length === 0) {
        return res.status(404).json({ error: 'Plant not found' });
      }

      let fichier_accord = currentPlant.rows[0].fichier_accord;

      if (file) {
        // New file uploaded - update file path
        fichier_accord = `/uploads/plants/${file.filename}`;

        // Delete old file if it exists
        if (currentPlant.rows[0]?.fichier_accord) {
          const oldFilePath = path.join(__dirname, '..', currentPlant.rows[0].fichier_accord);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
      } else if (keepExistingFile !== 'true') {
        // No file and not keeping existing - clear file data
        fichier_accord = null;

        // Delete old file if it exists
        if (currentPlant.rows[0]?.fichier_accord) {
          const oldFilePath = path.join(__dirname, '..', currentPlant.rows[0].fichier_accord);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
      }

      const query = `
        UPDATE plants
        SET 
          plant = $1,
          "Acheteur_avo" = $2,
          alias = $3,
          top = $4,
          incoterms = $5,
          "place of incoterms" = $6,
          fichier_accord = $7
        WHERE plant_id = $8
        RETURNING *
      `;

      const result = await db.query(query, [
        plant,
        Acheteur_avo || null,
        alias || null,
        top || null,
        incoterms || null,
        place_of_incoterms || null,
        fichier_accord,
        id
      ]);

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating plant:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
  }
);

// 🆕 Delete plant
router.delete('/api/plants/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // First, get the plant to delete the associated file
    const plantResult = await db.query(
      'SELECT fichier_accord FROM plants WHERE plant_id = $1',
      [id]
    );

    if (plantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    // Delete associated file if it exists
    if (plantResult.rows[0]?.fichier_accord) {
      const filePath = path.join(__dirname, '..', plantResult.rows[0].fichier_accord);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete the plant record
    const result = await db.query(
      'DELETE FROM plants WHERE plant_id = $1 RETURNING *',
      [id]
    );

    res.json({
      message: 'Plant deleted successfully',
      deletedPlant: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting plant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router;
