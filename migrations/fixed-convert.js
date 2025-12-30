// migrations/fixed-convert.js
import fs from 'fs';
import path from 'path';

const csvFilePath = './Loan Tracking.csv';

function parseCSV(text) {
  const lines = text.split('\n');
  const result = [];
  
  // Remove BOM and get headers from first line
  const headerLine = lines[0].replace(/^\uFEFF/, '');
  const headers = headerLine.split(',').map(h => h.trim());
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || 
        line.includes('---') || 
        line.includes('Product Totals') || 
        line.includes('Branch Totals') ||
        line.includes('Head Office') ||
        line.includes('GLD mukatale')) {
      continue;
    }
    
    // Manual CSV parsing that handles quoted fields with commas
    const fields = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField);
        currentField = '';
      } else {
        currentField += char;
      }
    }
    fields.push(currentField); // Add last field
    
    const obj = {};
    for (let k = 0; k < headers.length && k < fields.length; k++) {
      obj[headers[k]] = fields[k].trim();
    }
    
    // Only add records with valid data
    if (obj['Name.'] && obj['Mem No.'] && obj['Principal'] && obj['Principal'] !== '0') {
      result.push(obj);
    }
  }
  
  return result;
}

function cleanNumber(str) {
  if (!str) return 0;
  // Remove all non-digit characters
  const cleaned = str.toString().replace(/[^0-9]/g, '');
  return parseInt(cleaned) || 0;
}

function cleanPhone(phone) {
  if (!phone) return '000000000';
  
  // Handle scientific notation
  if (phone.includes('E+')) {
    const num = parseFloat(phone);
    return Math.floor(num).toString();
  }
  
  // Take first number if multiple
  const firstNum = phone.split('/')[0].trim();
  let numbers = firstNum.replace(/\D/g, '');
  
  // Convert 256 to 0 format
  if (numbers.startsWith('256') && numbers.length >= 12) {
    numbers = '0' + numbers.substring(3);
  }
  
  return numbers || '000000000';
}

function determineProductType(location) {
  if (!location) return 'mukatale';
  const loc = location.toString().toUpperCase();
  if (loc.includes('TAXI')) return 'taxi';
  if (loc.includes('BODA')) return 'boda';
  if (loc.includes('BUSINESS')) return 'business';
  if (loc.includes('SCHOOL')) return 'school_fees';
  if (loc.includes('STAFF')) return 'staff';
  return 'mukatale';
}

// Main execution
try {
  console.log('📖 Reading CSV file...');
  
  if (!fs.existsSync(csvFilePath)) {
    console.log('❌ CSV file not found');
    process.exit(1);
  }
  
  const csvData = fs.readFileSync(csvFilePath, 'utf8');
  console.log(`✅ CSV file read (${csvData.length} chars)`);
  
  const jsonData = parseCSV(csvData);
  console.log(`📊 Parsed ${jsonData.length} records`);
  
  if (jsonData.length === 0) {
    console.log('❌ No records parsed');
    process.exit(1);
  }
  
  // Convert to migration format
  const migrationData = jsonData.map(record => {
    const fieldKeys = Object.keys(record);
    const location = record.Location || record[fieldKeys[fieldKeys.length - 1]] || 'GLD mukatale';
    
    return {
      name: record['Name.'] || '',
      memNo: record['Mem No.'] || '',
      phone: cleanPhone(record.Phone || ''),
      principal: cleanNumber(record.Principal || ''),
      interest: cleanNumber(record.Interest || ''),
      date: record.Date || '',
      expiryDate: record['Expiry Date'] || '',
      principalPaid: cleanNumber(record['Princ Paid'] || ''),
      interestPaid: cleanNumber(record['Int Paid'] || ''),
      penaltyPaid: cleanNumber(record['Penalty Paid'] || ''),
      totalPaid: cleanNumber(record['Total Paid'] || ''),
      principalOutstanding: cleanNumber(record['Princ Outstanding'] || ''),
      interestOutstanding: cleanNumber(record['Int Outstanding'] || ''),
      penaltyOutstanding: cleanNumber(record['Penalty Outstanding'] || ''),
      totalOutstanding: cleanNumber(record['Total Outstanding'] || ''),
      location: location,
      productType: determineProductType(location)
    };
  }).filter(record => record.name && record.memNo && record.principal > 0);

  console.log(`✅ Prepared ${migrationData.length} records for migration`);
  
  // Show samples
  console.log('\n📋 Sample records:');
  migrationData.slice(0, 3).forEach((record, i) => {
    console.log(`${i + 1}. ${record.name} - UGX ${record.principal.toLocaleString()}`);
  });
  
  // Save data
  fs.writeFileSync('./migrations/loan-data-converted.json', JSON.stringify(migrationData, null, 2));
  
  const migrationCode = `// AUTO-GENERATED FROM CSV
const loanData = ${JSON.stringify(migrationData, null, 2)};
export default loanData;`;
  
  fs.writeFileSync('./migrations/loan-data.js', migrationCode);
  console.log('💾 Saved to migrations/loan-data.js');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}