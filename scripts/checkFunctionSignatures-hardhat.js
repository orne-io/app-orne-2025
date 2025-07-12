// scripts/checkFunctionSignatures-hardhat.js
// Usage: npx hardhat run scripts/checkFunctionSignatures-hardhat.js --contract <ContractName>
// Prints all function selectors for the contract ABI from Hardhat artifacts

const hre = require("hardhat");
const { ethers } = require("ethers");

async function main() {
  const args = process.argv.slice(2);
  let contractName = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--contract' && args[i+1]) {
      contractName = args[i+1];
    }
  }
  if (!contractName) {
    console.error('Usage: npx hardhat run scripts/checkFunctionSignatures-hardhat.js --contract <ContractName>');
    process.exit(1);
  }

  // Load ABI from Hardhat artifacts
  const artifact = await hre.artifacts.readArtifact(contractName);
  const abi = artifact.abi;

  console.log(`Function selectors for ${contractName}:`);
  abi.forEach((item) => {
    if (item.type === 'function') {
      const signature = `${item.name}(${item.inputs.map(i => i.type).join(',')})`;
      const selector = ethers.id(signature).slice(0, 10); // 0x + 8 chars
      console.log(`${signature}: ${selector}`);
    }
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}); 