const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL || 'https://lwvrejloimuvaravltfd.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;
const isSupabaseConfigured = supabaseKey && !supabaseKey.startsWith('YOUR_');

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase Client Initialized successfully.');
  } catch (err) {
    console.error('❌ Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('⚠️ Supabase key not set. Database client is running in LOCAL FALLBACK mode.');
}

// Local JSON file paths
const vendorsFile = path.join(__dirname, 'vendors.json');
const sdsFile = path.join(__dirname, 'sds_extracted_data.json');
const usersFile = path.join(__dirname, 'users.json');

// Helper: load local JSON file
function readLocal(filePath, defaultData = []) {
  if (!fs.existsSync(filePath)) return defaultData;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return defaultData;
  }
}

// Helper: write local JSON file
function writeLocal(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Failed to write local database file ${filePath}:`, err.message);
  }
}

// ────────────────────────────────────────────────────────────────
// DATABASE CLIENT INTERFACE
// ────────────────────────────────────────────────────────────────
const db = {
  // ── Vendors ──
  async getVendors() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('vendors').select('*');
      if (!error) return data;
      console.error('Supabase getVendors error, falling back:', error.message);
    }
    return readLocal(vendorsFile);
  },

  async saveVendor(vendor) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('vendors').upsert({
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
        contact: vendor.contact,
        request_date: vendor.requestDate || null,
        last_response_date: vendor.lastResponseDate || null,
        status: vendor.status,
        compliance_status: vendor.complianceStatus
      }).select();
      if (!error) return data;
      console.error('Supabase saveVendor error:', error.message);
    }
    
    const list = readLocal(vendorsFile);
    const idx = list.findIndex(v => v.id === vendor.id || v.email === vendor.email);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...vendor };
    } else {
      list.push(vendor);
    }
    writeLocal(vendorsFile, list);
    return vendor;
  },

  async deleteVendor(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('vendors').delete().eq('id', id);
      if (!error) return true;
      console.error('Supabase deleteVendor error:', error.message);
    }
    const list = readLocal(vendorsFile);
    const updated = list.filter(v => v.id !== id);
    writeLocal(vendorsFile, updated);
    return true;
  },

  // ── SDS Documents ──
  async getSdsDocuments() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('sds_documents').select('*');
      if (!error) {
        // Map keys to camelCase for React
        return data.map(d => ({
          id: d.id,
          vendorName: d.vendor_name,
          fileName: d.file_name,
          receivedDate: d.received_date,
          productName: d.product_name,
          emergencyPhone: d.emergency_phone,
          revisionDate: d.revision_date,
          ghsClassification: d.ghs_classification,
          processingStatus: d.processing_status,
          failureReason: d.failure_reason
        }));
      }
      console.error('Supabase getSdsDocuments error:', error.message);
    }
    return readLocal(sdsFile);
  },

  async saveSdsDocument(doc) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('sds_documents').upsert({
        id: doc.id,
        vendor_name: doc.vendorName,
        file_name: doc.fileName,
        received_date: doc.receivedDate || null,
        product_name: doc.productName,
        emergency_phone: doc.emergencyPhone,
        revision_date: doc.revisionDate,
        ghs_classification: doc.ghsClassification,
        processing_status: doc.processingStatus,
        failure_reason: doc.failureReason
      }).select();
      if (!error) return data;
      console.error('Supabase saveSdsDocument error:', error.message);
    }
    
    const list = readLocal(sdsFile);
    const idx = list.findIndex(d => d.fileName === doc.fileName);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...doc };
    } else {
      list.push(doc);
    }
    writeLocal(sdsFile, list);
    return doc;
  },

  //-- 4. Vendor Logins Table
  async getVendorLoginByEmail(email) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('vendor_logins').select('*').eq('email', email).single();
      if (!error) return data;
      console.error('Supabase getVendorLoginByEmail error:', error.message);
    }
    const list = readLocal(vendorLoginsFile);
    return list.find(l => l.email === email) || null;
  },

  async saveVendorLogin(login) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('vendor_logins').upsert({
        id: login.id,
        vendor_id: login.vendorId,
        email: login.email,
        password_hash: login.passwordHash
      }).select();
      if (!error) return data;
      console.error('Supabase saveVendorLogin error:', error.message);
    }
    const list = readLocal(vendorLoginsFile);
    const idx = list.findIndex(l => l.email === login.email);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...login };
    } else {
      list.push(login);
    }
    writeLocal(vendorLoginsFile, list);
    return login;
  },

  // ── Portal Users ──
  async saveUser(user) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('users').upsert({
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        provider: user.provider
      }).select();
      if (!error) return data;
      console.error('Supabase saveUser error:', error.message);
    }
    
    const list = readLocal(usersFile);
    const idx = list.findIndex(u => u.email === user.email);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...user };
    } else {
      list.push(user);
    }
    writeLocal(usersFile, list);
    return user;
  }
};

// Local JSON file paths for vendor logins
const vendorLoginsFile = path.join(__dirname, 'vendor_logins.json');

// ── Vendor Logins ──
async function getVendorLoginByEmail(email) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('vendor_logins').select('*').eq('email', email).single();
    if (!error) return data;
    console.error('Supabase getVendorLoginByEmail error:', error.message);
  }
  const list = readLocal(vendorLoginsFile);
  return list.find(l => l.email === email) || null;
}

async function saveVendorLogin(login) {
  // login: { id, vendorId, email, passwordHash }
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('vendor_logins').upsert({
      id: login.id,
      vendor_id: login.vendorId,
      email: login.email,
      password_hash: login.passwordHash
    }).select();
    if (!error) return data;
    console.error('Supabase saveVendorLogin error:', error.message);
  }
  const list = readLocal(vendorLoginsFile);
  const idx = list.findIndex(l => l.email === login.email);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...login };
  } else {
    list.push(login);
  }
  writeLocal(vendorLoginsFile, list);
  return login;
}

module.exports = db;
