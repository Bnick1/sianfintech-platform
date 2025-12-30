// migrations/bulletproof-convert.js
import fs from 'fs';
import readline from 'readline';

const csvFilePath = './Loan Tracking.csv';

async function parseCSV() {
  const fileStream = fs.createReadStream(csvFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const records = [];
  let lineCount = 0;

  for await (const line of rl) {
    lineCount++;
    
    // Skip header and empty lines
    if (lineCount <= 3 || !line.trim() || line.includes('---') || line.includes('Product Totals')) {
      continue;
    }

    // Simple comma splitting - your data seems consistently formatted
    const fields = line.split(',').map(f => f.trim().replace(/"/g, ''));
    
    if (fields.length >= 17 && fields[0] && fields[1] && fields[5]) {
      const record = {
        name: fields[0],
        memNo: fields[1],
        phone: fields[3] || '',
        principal: parseInt(fields[5].replace(/\D/g, '')) || 0,
        interest: parseInt(fields[6].replace(/\D/g, '')) || 0,
        date: fields[7] || '',
        expiryDate: fields[8] || '',
        principalPaid: parseInt(fields[9].replace(/\D/g, '')) || 0,
        interestPaid: parseInt(fields[10].replace(/\D/g, '')) || 0,
        penaltyPaid: parseInt(fields[11].replace(/\D/g, '')) || 0,
        totalPaid: parseInt(fields[12].replace(/\D/g, '')) || 0,
        principalOutstanding: parseInt(fields[13].replace(/\D/g, '')) || 0,
        interestOutstanding: parseInt(fields[14].replace(/\D/g, '')) || 0,
        penaltyOutstanding: parseInt(fields[15].replace(/\D/g, '')) || 0,
        totalOutstanding: parseInt(fields[16].replace(/\D/g, '')) || 0,
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

  return records;
}

// Main execution
async function main() {
  try {
    console.log('📖 Reading CSV file line by line...');
    
    if (!fs.existsSync(csvFilePath)) {
      console.log('❌ CSV file not found');
      return;
    }

    const records = await parseCSV();
    console.log(`✅ Parsed ${records.length} records`);

    if (records.length === 0) {
      console.log('❌ No records found. File structure may be different than expected.');
      return;
    }

    // Save the data
    const migrationCode = `// AUTO-GENERATED FROM CSV
const loanData = ${JSON.stringify(records, null, 2)};
export default loanData;`;

    fs.writeFileSync('./migrations/loan-data.js', migrationCode);
    console.log('💾 Saved to migrations/loan-data.js');

    // Show samples
    console.log('\n📋 First 3 records:');
    records.slice(0, 3).forEach((record, i) => {
      console.log(`${i + 1}. ${record.name} (${record.memNo}) - UGX ${record.principal.toLocaleString()}`);
    });

    console.log(`\n📊 Total: ${records.length} loan records ready for migration`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();