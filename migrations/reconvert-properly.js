// migrations/reconvert-properly.js
import fs from 'fs';

const csvData = fs.readFileSync('./Loan Tracking.csv', 'utf8');
const lines = csvData.split('\n').filter(line => line.trim());

console.log('🔄 Re-converting CSV with proper number handling...');

const records = [];

for (let i = 3; i < lines.length; i++) { // Start from line 3 to skip headers
  const line = lines[i];
  
  if (line.includes('---') || line.includes('Product Totals') || line.includes('Branch Totals')) {
    continue;
  }

  // Split by comma and clean fields
  const fields = line.split(',').map(f => {
    let field = f.trim();
    // Remove surrounding quotes but keep commas for number parsing
    field = field.replace(/^"(.*)"$/, '$1');
    return field;
  });

  if (fields.length >= 17 && fields[0] && fields[1]) {
    // Function to properly parse numbers like "100,000"
    const parseMoney = (str) => {
      if (!str || str === '0') return 0;
      // Remove commas and parse
      const cleaned = str.toString().replace(/,/g, '');
      const num = parseInt(cleaned);
      return isNaN(num) ? 0 : num;
    };

    const record = {
      name: fields[0],
      memNo: fields[1],
      phone: fields[3] || '',
      principal: parseMoney(fields[5]),
      interest: parseMoney(fields[6]),
      date: fields[7] || '',
      expiryDate: fields[8] || '',
      principalPaid: parseMoney(fields[9]),
      interestPaid: parseMoney(fields[10]),
      penaltyPaid: parseMoney(fields[11]),
      totalPaid: parseMoney(fields[12]),
      principalOutstanding: parseMoney(fields[13]),
      interestOutstanding: parseMoney(fields[14]),
      penaltyOutstanding: parseMoney(fields[15]),
      totalOutstanding: parseMoney(fields[16]),
      location: fields[17] || 'GLD mukatale',
      productType: 'mukatale'
    };

    // Determine product type
    if (record.location.includes('TAXI')) record.productType = 'taxi';
    else if (record.location.includes('BODA')) record.productType = 'boda';
    else if (record.location.includes('BUSINESS')) record.productType = 'business';
    else if (record.location.includes('SCHOOL')) record.productType = 'school_fees';
    else if (record.location.includes('Staff')) record.productType = 'staff';

    records.push(record);
  }
}

console.log(`✅ Converted ${records.length} records`);

// Show samples to verify numbers are correct
console.log('\n📋 Sample Records (with proper amounts):');
records.slice(0, 5).forEach((record, i) => {
  console.log(`${i + 1}. ${record.name}:`);
  console.log(`   Principal: UGX ${record.principal.toLocaleString()}`);
  console.log(`   Interest: UGX ${record.interest.toLocaleString()}`);
  console.log(`   Outstanding: UGX ${record.totalOutstanding.toLocaleString()}`);
});

// Calculate totals
const totalPrincipal = records.reduce((sum, r) => sum + r.principal, 0);
const totalOutstanding = records.reduce((sum, r) => sum + r.totalOutstanding, 0);

console.log(`\n💰 Total Principal: UGX ${totalPrincipal.toLocaleString()}`);
console.log(`💰 Total Outstanding: UGX ${totalOutstanding.toLocaleString()}`);

// Save the properly converted data
const migrationCode = `// PROPERLY CONVERTED LOAN DATA
const loanData = ${JSON.stringify(records, null, 2)};
export default loanData;`;

fs.writeFileSync('./migrations/loan-data.js', migrationCode);
console.log('\n💾 Saved properly converted data to migrations/loan-data.js');