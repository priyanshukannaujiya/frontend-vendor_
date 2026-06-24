require('dotenv').config();
const db = require('./db');

async function clearDb() {
  console.log('Clearing all dummy data from system...');
  
  const fs = require('fs');
  const path = require('path');
  try {
    fs.writeFileSync(path.join(__dirname, 'vendors.json'), '[]');
    fs.writeFileSync(path.join(__dirname, 'sds_extracted_data.json'), '[]');
    fs.writeFileSync(path.join(__dirname, 'vendor_logins.json'), '[]');
  } catch(e) {}

  if (process.env.SUPABASE_KEY && process.env.SUPABASE_KEY.startsWith('eyJ')) {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(process.env.SUPABASE_URL || 'https://lwvrejloimuvaravltfd.supabase.co', process.env.SUPABASE_KEY);
    await supabase.from('vendors').delete().neq('id', 'dummy');
    await supabase.from('sds_documents').delete().neq('id', 'dummy');
    await supabase.from('vendor_logins').delete().neq('id', 'dummy');
  }

  console.log('Done clearing dummy data.');
}

clearDb();
