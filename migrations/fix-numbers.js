// migrations/fix-numbers.js
import fs from 'fs';

// Read the current loan data
import loanData from './loan-data.js';

console.log('🔧 Fixing number formatting...');

// Better number cleaning that preserves full amounts
function properCleanNumber(str) {
  if (!str || str === '0') return 0;
  
  // Handle cases like "100,000" - remove commas but keep all digits
  const cleaned = str.toString().replace(/,/g, '');
  
  // Parse as integer
  const number = parseInt(cleaned);
  
  if (isNaN(number)) {
    console.log(`Warning: Could not parse number from: "${str}"`);
    return 0;
  }
  
  return number;
}

// Fix all records
const fixedData = loanData.map(record => {
  return {
    ...record,
    principal: properCleanNumber(record.principal),
    interest: properCleanNumber(record.interest),
    principalPaid: properCleanNumber(record.principalPaid),
    interestPaid: properCleanNumber(record.interestPaid),
    penaltyPaid: properCleanNumber(record.penaltyPaid),
    totalPaid: properCleanNumber(record.totalPaid),
    principalOutstanding: properCleanNumber(record.principalOutstanding),
    interestOutstanding: properCleanNumber(record.interestOutstanding),
    penaltyOutstanding: properCleanNumber(record.penaltyOutstanding),
    totalOutstanding: properCleanNumber(record.totalOutstanding)
  };
});

console.log(`✅ Fixed ${fixedData.length} records`);

// Show before/after comparison
console.log('\n📊 Before/After Comparison:');
loanData.slice(0, 3).forEach((oldRecord, i) => {
  const newRecord = fixedData[i];
  console.log(`\n${i + 1}. ${oldRecord.name}:`);
  console.log(`   Principal: ${oldRecord.principal} → ${newRecord.principal.toLocaleString()}`);
  console.log(`   Interest: ${oldRecord.interest} → ${newRecord.interest.toLocaleString()}`);
});

// Save the fixed data
const fixedCode = `// FIXED LOAN DATA - Proper number formatting
const loanData = ${JSON.stringify(fixedData, null, 2)};
export default loanData;`;

fs.writeFileSync('./migrations/loan-data.js', fixedCode);
console.log('\n💾 Saved fixed data to migrations/loan-data.js');

// Show summary
const totalPortfolio = fixedData.reduce((sum, record) => sum + record.principal, 0);
console.log(`\n💰 Total Loan Portfolio: UGX ${totalPortfolio.toLocaleString()}`);