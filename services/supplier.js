// routes/supplier.js
const express = require('express');
const router = express.Router();
const db = require('./db');

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
      logistics_agreement, payment_conditions, tech_key_account
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
        logistics_agreement, payment_conditions, tech_key_account
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19,
        $20, $21, $22, $23, $24, $25, $26, $27, $28,
        $29, $30, $31, $32, $33, $34, $35, $36, $37,
        $38, $39, $40, $41, $42, $43, $44, $45, $46
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
      payment_conditions || null, tech_key_account || null
    ];

    console.log('VALUES ARRAY LENGTH:', values.length); // This should be 46

    const result = await db.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating unit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// 🆕 Update unit
router.put('/api/units/:id', async (req, res) => {
  try {
    const { unit_name, city, country, zone_name, com_person_id, supplier_id } = req.body;
    const { id } = req.params;

    if (!unit_name) {
      return res.status(400).json({ error: 'Unit name is required' });
    }

    const query = `
      UPDATE unit
      SET unit_name = $1, 
          city = $2, 
          country = $3, 
          zone_name = $4, 
          com_person_id = $5,
          supplier_id = $6
      WHERE unit_id = $7
      RETURNING *
    `;
    
    const result = await db.query(query, [
      unit_name, 
      city || null, 
      country || null, 
      zone_name || null, 
      com_person_id || null,
      supplier_id,
      id
    ]);
    
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
router.post('/api/certificates', async (req, res) => {
  try {
    const { unit_id, Type, Date } = req.body;
    
    if (!unit_id || !Type || !Date) {
      return res.status(400).json({ error: 'Unit ID, type, and date are required' });
    }

    const query = `
      INSERT INTO certificat (unit_id, "Type", "Date")
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await db.query(query, [unit_id, Type, Date]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating certificate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🆕 Update certificate
router.put('/api/certificates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { Type, Date } = req.body;

    if (!Type || !Date) {
      return res.status(400).json({ error: 'Type and date are required' });
    }

    const query = `
      UPDATE certificat
      SET "Type" = $1, "Date" = $2
      WHERE certificat_id = $3
      RETURNING *
    `;
    
    const result = await db.query(query, [Type, Date, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating certificate:', error);
    res.status(500).json({ error: 'Internal server error' });
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
          // Certificates for this unit - IMPORTANT: Use the certificates from the query
          certificates: (unit.certificates || []).map(cert => ({
            certificat_id: cert.certificat_id,
            Type: cert.Type,  // This should match the column name "Type"
            validity_date: cert.validity_date,  // This is from "Date" as validity_date
            unit_id: cert.unit_id
          }))
        };
        
        return unitObj;
      })
    };

    console.log('🔍 Backend complete endpoint returning:', {
      groupName: customerData.supplier_name,
      unitsCount: customerData.units.length,
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
