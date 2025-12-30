// migrations/convert-csv-to-json.js
import fs from 'fs';
import path from 'path';

const csvFilePath = './Loan Tracking.csv';

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote inside quotes
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      // Regular character
      current += char;
    }
  }
  
  // Add the last field
  result.push(current);
  return result;
}

function convertCSVToJSON(csvText) {
  // Remove UTF-8 BOM if present
  if (csvText.charCodeAt(0) === 0xFEFF) {
    csvText = csvText.substring(1);
  }
  
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }
  
  // Parse headers
  const headerFields = parseCSVLine(lines[0]);
  const headers = headerFields.map(header => header.trim());
  
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip summary lines and empty headers
    if (line.includes('---') || line.includes('Product Totals') || 
        line.includes('Branch Totals') || line.includes('GRAND TOTALS') ||
        line.includes('Head Office') || line.includes('GLD mukatale')) {
      continue;
    }
    
    const fields = parseCSVLine(line);
    const obj = {};
    
    for (let j = 0; j < headers.length && j < fields.length; j++) {
      obj[headers[j]] = fields[j].trim();
    }
    
    // Only add if it has valid data (has a name and member number)
    if (obj['Name.'] && obj['Mem No.'] && obj['Name.'] !== 'Head Office' && obj['Name.'] !== 'GLD mukatale') {
      result.push(obj);
    }
  }
  
  return result;
}

function cleanNumber(str) {
  if (!str || str === '""' || str === '0' || str === '') return 0;
  // Remove all non-digit characters except minus sign
  const cleaned = str.toString().replace(/[^0-9]/g, '');
  const number = parseInt(cleaned);
  return isNaN(number) ? 0 : number;
}

function cleanPhone(phone) {
  if (!phone) return '000000000';
  
  // Handle scientific notation
  if (phone.includes('E+')) {
    const num = parseFloat(phone);
    return Math.floor(num).toString();
  }
  
  // Take first phone number if multiple separated by /
  const firstPhone = phone.split('/')[0].trim();
  const numbers = firstPhone.replace(/\D/g, '');
  
  // Convert 256 to 0 format
  if (numbers.startsWith('256') && numbers.length > 9) {
    return '0' + numbers.substring(3);
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
    console.log('❌ CSV file not found at:', path.resolve(csvFilePath));
    process.exit(1);
  }
  
  const csvData = fs.readFileSync(csvFilePath, 'utf8');
  console.log(`✅ CSV file read successfully (${csvData.length} characters)`);
  
  const jsonData = convertCSVToJSON(csvData);
  console.log(`📊 Converted ${jsonData.length} valid records`);
  
  if (jsonData.length === 0) {
    console.log('❌ No valid records found after conversion');
    console.log('First few parsed records:');
    const testLines = csvData.split('\n').slice(0, 10);
    testLines.forEach((line, index) => {
      console.log(`Line ${index}:`, parseCSVLine(line));
    });
    process.exit(1);
  }
  
  // Convert to migration format
  const migrationData = jsonData.map(record => {
    // Location is the last field
    const fieldKeys = Object.keys(record);
    const location = record.Location || record[fieldKeys[fieldKeys.length - 1]] || 'GLD mukatale';
    
    const migrationRecord = {
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
    
    return migrationRecord;
  }).filter(record => 
    record.name && 
    record.memNo && 
    record.principal > 0
  );

  console.log(`✅ Prepared ${migrationData.length} records for migration`);
  
  // Show sample of first record
  console.log('\n📋 Sample of first record:');
  console.log(JSON.stringify(migrationData[0], null, 2));
  
  // Save the converted data
  fs.writeFileSync('./migrations/loan-data-converted.json', JSON.stringify(migrationData, null, 2));
  console.log('💾 Saved converted data to migrations/loan-data-converted.json');
  
  // Create the migration module
  const migrationCode = `// AUTO-GENERATED FROM CSV - Loan Data
const loanData = ${JSON.stringify(migrationData, null, 2)};

// Use this array in your migration script
export default loanData;
`;
  
  fs.writeFileSync('./migrations/loan-data.js', migrationCode);
  console.log('💾 Saved ready-to-use migration data to migrations/loan-data.js');
  
  // Show summary
  console.log('\n📊 Summary:');
  console.log(`Total records: ${migrationData.length}`);
  
  const productBreakdown = {};
  migrationData.forEach(record => {
    productBreakdown[record.productType] = (productBreakdown[record.productType] || 0) + 1;
  });
  
  console.log('Product breakdown:');
  Object.entries(productBreakdown).forEach(([type, count]) => {
    console.log(`  ${type}: ${count} records`);
  });
  
} catch (error) {
  console.error('❌ Error converting CSV:', error.message);
  console.log('Stack:', error.stack);
}