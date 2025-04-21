const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      ...options,
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

async function main() {
  try {
    
    console.log('\nEnvironment variables loaded:');
    console.log('- DEVELOPER_ADDRESS:', process.env.DEVELOPER_ADDRESS ? 'Set' : 'Not set');
    console.log('- FUND_AMOUNT:', process.env.FUND_AMOUNT || 'Not set');

    if (!fs.existsSync('node_modules')) {
      console.log('Installing dependencies...');
      execSync('npm install', { stdio: 'inherit' });
    }

    console.log('\nCompiling contracts...');
    await runCommand('npx', ['hardhat', 'compile']);

    let hardhatProcess;
    try {
      await fetch('http://127.0.0.1:8545', { method: 'POST' });
      console.log('\nHardhat node is already running');
    } catch {
      console.log('\nStarting Hardhat node...');
      hardhatProcess = spawn('npx', ['hardhat', 'node'], {
        stdio: 'inherit',
        shell: true,
        detached: true
      });

      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    if (process.env.DEVELOPER_ADDRESS) {
      console.log('\nFunding developer account...');
      try {
        await runCommand('npx', ['hardhat', 'run', 'scripts/fund-account.js', '--network', 'localhost']);
      } catch (error) {
        console.error(`Error funding account: ${error.message}`);
      }
    } else {
      console.log('\nSkipping account funding - DEVELOPER_ADDRESS not set in .env');
    }

    console.log('\nDeploying contracts...');
    await runCommand('npm', ['run', 'deploy']);

    console.log('\nUpdating frontend contract addresses...');
    const contractAddresses = require('../contract-addresses.json');
    const frontendPath = path.join(__dirname, '../frontend/utils/contractAddresses.js');
    
    const addressesContent = `
export const contractAddresses = ${JSON.stringify(contractAddresses, null, 2)};
`;
    
    fs.writeFileSync(frontendPath, addressesContent);

    console.log('\nStarting frontend...');
    await runCommand('npm', ['run', 'dev'], { cwd: './frontend' });

    process.on('SIGINT', () => {
      if (hardhatProcess) {
        process.kill(-hardhatProcess.pid);
      }
      process.exit();
    });

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();