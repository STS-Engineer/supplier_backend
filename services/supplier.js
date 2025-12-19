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

// Get all groups with their units (existing)
router.get('/api/groups', async (req, res) => {
  try {
    const query = `
      SELECT 
        g.supplier_id,
        g.supplier_name,
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
        u.payment_conditions,
        u.tech_key_account,
        u.document_file,
        u.mainplants,
        u.responsible,
        u.plant,
        u.top,
        u.status,
        u.category,
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
          payment_conditions: row.payment_conditions,
          tech_key_account: row.tech_key_account,
          document_file: row.document_file,
          mainplants: row.mainplants,
          responsible_text: row.responsible, // to avoid confusion with Person
          plant: row.plant,
          top: row.top,
          status: row.status,
          category: row.category,
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



// 🆕 Serve certificate files
router.get('/uploads/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    console.log('📁 Serving file:', {
      filename,
      filePath,
      exists: fs.existsSync(filePath)
    });
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.doc') {
      contentType = 'application/msword';
    } else if (ext === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    
    res.setHeader('Content-Type', contentType);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unit details by ID (existing)
router.get('/api/units/:id', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.*,
        g.supplier_name,
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
    const unitDetails = {
      unit_id: unit.unit_id,
      unit_name: unit.unit_name,
      supplier_name: unit.supplier_name,
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
      payment_conditions: unit.payment_conditions,
      tech_key_account: unit.tech_key_account,
      document_file: unit.document_file,
      mainplants: unit.mainplants,
      responsible_text: unit.responsible,
      plant: unit.plant,
      top: unit.top,
      status: unit.status,
      category: unit.category,
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
    const { supplier_name, description } = req.body;

    if (!supplier_name) {
      return res.status(400).json({ error: 'Supplier name is required' });
    }

    const query = `
      INSERT INTO supplier (supplier_name, description)
      VALUES ($1, $2)
      RETURNING *
    `;

    const result = await db.query(query, [supplier_name, description || null]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🆕 Update group
router.put('/api/groups/:id', async (req, res) => {
  try {
    const { supplier_name, description } = req.body;
    const { id } = req.params;

    if (!supplier_name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const query = `
      UPDATE supplier
      SET supplier_name = $1, description = $2
      WHERE supplier_id = $3
      RETURNING *
    `;

    const result = await db.query(query, [supplier_name, description || null, id]);

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

    // ✅ First, delete all units related to the group
    await db.query('DELETE FROM unit WHERE supplier_id = $1', [id]);

    // ✅ Then delete the group itself
    const deleteGroup = await db.query(
      'DELETE FROM supplier WHERE supplier_id = $1 RETURNING *',
      [id]
    );

    if (deleteGroup.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({
      message: 'Group and associated units deleted successfully',
      deletedGroup: deleteGroup.rows[0]
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
      logistics_agreement, payment_conditions, tech_key_account,
      document_file, mainplants, responsible, plant, top, status, category
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
        logistics_agreement, payment_conditions, tech_key_account, 
        document_file, mainplants, plant, top, status, category, responsible
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19,
        $20, $21, $22, $23, $24, $25, $26, $27, $28,
        $29, $30, $31, $32, $33, $34, $35, $36, $37,
        $38, $39, $40, $41, $42, $43, $44, $45, $46,
        $47, $48, $49, $50, $51, $52, $53
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
      payment_conditions || null, tech_key_account || null,
      document_file || null,
      // NEW FIELDS - make sure mainplants is properly formatted
      mainplants ? (Array.isArray(mainplants) ? mainplants.join(',') : mainplants) : null,
      plant || null,
      top || null,
      status || null,
      category || null,
      responsible || null  // This should come last
    ];

    console.log('VALUES ARRAY LENGTH:', values.length); // This should be 53
    console.log('Main plants value:', mainplants);
    console.log('Responsible value:', responsible);

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
      logistics_agreement, payment_conditions, tech_key_account,
      document_file, mainplants, responsible, plant, top, status, category
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
        payment_conditions = $45, tech_key_account = $46, 
        document_file = $47, mainplants = $48, plant = $49, 
        top = $50, status = $51, category = $52, responsible = $53
      WHERE unit_id = $54
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
      payment_conditions || null, tech_key_account || null,
      document_file || null,
      mainplants ? (Array.isArray(mainplants) ? mainplants.join(',') : mainplants) : null,
      plant || null, top || null, status || null, category || null, responsible || null,
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

// 🆕 Create new certificate
// 🆕 Create new certificate - FIXED FILE HANDLING
router.post(
  '/api/certificates',
  upload.single('file'),
  async (req, res) => {
    try {
      console.log('📥 Creating certificate request received');
      console.log('Request body:', req.body);
      console.log('Request file:', req.file);
      
      const { unit_id, Type, Date, validity_date, custom_type } = req.body;
      const file = req.file;
      
      // Use either Date or validity_date
      const certDate = Date || validity_date;
      
      console.log('Parsed data:', { 
        unit_id, 
        Type, 
        Date: certDate, 
        file: file?.filename,
        custom_type 
      });

      if (!unit_id || !Type || !certDate) {
        console.log('❌ Missing required fields:', { unit_id, Type, Date: certDate });
        // Delete uploaded file if validation fails
        if (file) {
          fs.unlinkSync(file.path);
        }
        return res.status(400).json({ 
          error: 'Unit ID, type, and date are required',
          received: { unit_id, Type, Date: certDate }
        });
      }

      // ✅ IMPORTANT: Store RELATIVE path in database
      const fileUrl = file ? `/uploads/${file.filename}` : null;
      const fileName = file ? file.originalname : null;
      const fileSize = file ? file.size : null;
      
      console.log('📂 File info to save:', { fileUrl, fileName, fileSize });

      const query = `
        INSERT INTO certificat 
          (unit_id, "Type", "Date", file_url, file_name, file_size, custom_type)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const result = await db.query(query, [
        unit_id,
        Type,
        certDate,
        fileUrl,
        fileName,
        fileSize,
        custom_type || null
      ]);
      
      const certificate = result.rows[0];
      
      console.log('✅ Certificate created successfully:', certificate);
      res.status(201).json(certificate);
    } catch (error) {
      console.error('❌ Error creating certificate:', error);
      
      // Clean up file if database insert fails
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }
      
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }
);

// 🆕 Update certificate - FIXED FILE HANDLING
router.put(
  '/api/certificates/:id', 
  upload.single('file'), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const { Type, Date, validity_date, custom_type, keepExistingFile } = req.body;
      const file = req.file;

      // Use either Date or validity_date
      const certDate = Date || validity_date;

      console.log('📝 Updating certificate:', {
        id, 
        Type, 
        Date: certDate, 
        custom_type,
        keepExistingFile,
        hasNewFile: !!file,
        fileInfo: file ? {
          filename: file.filename,
          originalname: file.originalname,
          size: file.size
        } : null
      });

      if (!Type || !certDate) {
        if (file) {
          fs.unlinkSync(file.path);
        }
        return res.status(400).json({ 
          error: 'Type and date are required'
        });
      }

      // Get current certificate data
      const currentCert = await db.query(
        'SELECT file_url, file_name, file_size FROM certificat WHERE certificat_id = $1',
        [id]
      );

      if (currentCert.rows.length === 0) {
        if (file) {
          fs.unlinkSync(file.path);
        }
        return res.status(404).json({ error: 'Certificate not found' });
      }

      let fileUrl = currentCert.rows[0].file_url;
      let fileName = currentCert.rows[0].file_name;
      let fileSize = currentCert.rows[0].file_size;

      if (file) {
        // New file uploaded - update file info
        fileUrl = `/uploads/${file.filename}`;
        fileName = file.originalname;
        fileSize = file.size;

        // Delete old file if exists
        if (currentCert.rows[0]?.file_url) {
          const oldFilePath = path.join(__dirname, '..', currentCert.rows[0].file_url);
          if (fs.existsSync(oldFilePath)) {
            try {
              fs.unlinkSync(oldFilePath);
              console.log('🗑️ Deleted old file:', oldFilePath);
            } catch (err) {
              console.error('Error deleting old file:', err);
            }
          }
        }
      } else if (keepExistingFile !== 'true') {
        // No new file and not keeping existing - clear file data
        if (currentCert.rows[0]?.file_url) {
          const oldFilePath = path.join(__dirname, '..', currentCert.rows[0].file_url);
          if (fs.existsSync(oldFilePath)) {
            try {
              fs.unlinkSync(oldFilePath);
              console.log('🗑️ Deleted file:', oldFilePath);
            } catch (err) {
              console.error('Error deleting file:', err);
            }
          }
        }
        fileUrl = null;
        fileName = null;
        fileSize = null;
      }

      const query = `
        UPDATE certificat
        SET 
          "Type" = $1, 
          "Date" = $2, 
          file_url = $3, 
          file_name = $4, 
          file_size = $5,
          custom_type = $6
        WHERE certificat_id = $7
        RETURNING *
      `;

      const result = await db.query(query, [
        Type,
        certDate,
        fileUrl,
        fileName,
        fileSize,
        custom_type || null,
        id
      ]);

      console.log('✅ Certificate updated successfully:', result.rows[0]);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('❌ Error updating certificate:', error);
      
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting uploaded file:', unlinkError);
        }
      }
      
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
  }
);

// 🆕 Delete certificate - WITH FILE CLEANUP
router.delete('/api/certificates/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get certificate to find associated file
    const certQuery = await db.query(
      'SELECT file_url FROM certificat WHERE certificat_id = $1',
      [id]
    );

    if (certQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Delete the file if it exists
    if (certQuery.rows[0]?.file_url) {
      const filePath = path.join(__dirname, '..', certQuery.rows[0].file_url);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log('🗑️ Deleted file:', filePath);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      }
    }

    // Delete certificate from database
    const result = await db.query(
      'DELETE FROM certificat WHERE certificat_id = $1 RETURNING *',
      [id]
    );

    console.log('✅ Certificate deleted successfully');
    res.json({
      message: 'Certificate deleted successfully',
      deletedCertificate: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error deleting certificate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🆕 Get certificate file (for preview/download)
router.get('/api/certificates/:id/file', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = await db.query(
      'SELECT file_url, file_name FROM certificat WHERE certificat_id = $1',
      [id]
    );
    
    if (query.rows.length === 0 || !query.rows[0].file_url) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const filePath = path.join(__dirname, '..', query.rows[0].file_url);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }
    
    // Set proper content-disposition header
    res.setHeader('Content-Disposition', `attachment; filename="${query.rows[0].file_name}"`);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error fetching certificate file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🆕 Get complete customer data (group with units, responsible persons, and certificates)
// 🆕 Get complete customer data (group with units, responsible persons, and certificates)
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

    // Get certificates for each unit
    const unitsWithCertificates = await Promise.all(
      unitsResult.rows.map(async (unit) => {
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

        return {
          ...unit,
          certificates: certificatesResult.rows
        };
      })
    );

    const customerData = {
      ...groupResult.rows[0],
      units: unitsWithCertificates.map(unit => {
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
          payment_conditions: unit.payment_conditions,
          tech_key_account: unit.tech_key_account,
          // Additional Information
          document_file: unit.document_file,
          mainplants: unit.mainplants,
          plant: unit.plant,
          top: unit.top,
          status: unit.status,
          category: unit.category,
          responsible_text: unit.responsible,
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
          }))
        };

        // Debug log for each unit
        console.log('🔍 Unit data being returned:', {
          unit_id: unit.unit_id,
          unit_name: unit.unit_name,
          mainplants: unit.mainplants,
          plant: unit.plant,
          top: unit.top,
          status: unit.status,
          category: unit.category
        });

        return unitObj;
      })
    };

    console.log('🔍 Backend complete endpoint returning:', {
      groupName: customerData.supplier_name,
      unitsCount: customerData.units.length,
      firstUnit: {
        name: customerData.units[0]?.unit_name,
        mainplants: customerData.units[0]?.mainplants,
        plant: customerData.units[0]?.plant,
        top: customerData.units[0]?.top,
        status: customerData.units[0]?.status,
        category: customerData.units[0]?.category
      },
      firstUnitCertificates: customerData.units[0]?.certificates?.length || 0
    });

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

module.exports = router;
