// scripts/checkFunctionSignatures.js
// Usage: node scripts/checkFunctionSignatures.js <ABI_JSON_FILE>
// Prints all function selectors for the contract ABI

const fs = require('fs');
const { ethers } = require('ethers');

if (process.argv.length < 3) {
  console.error('Usage: node scripts/checkFunctionSignatures.js <ABI_JSON_FILE>');
  process.exit(1);
}

const abiFile = process.argv[2];
const abi = JSON.parse(fs.readFileSync(abiFile, 'utf8'));

console.log('Function selectors:');
abi.forEach((item) => {
  if (item.type === 'function') {
    const signature = `${item.name}(${item.inputs.map(i => i.type).join(',')})`;
    const selector = ethers.id(signature).slice(0, 10); // 0x + 8 chars
    console.log(`${signature}: ${selector}`);
  }
}); 