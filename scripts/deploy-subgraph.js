#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const exec = require('child_process').execSync;

const args = process.argv.slice(2);
const subgraphName = args[0] || 'your-username/unbound';

const network = args[1] || 'localhost';

console.log(`Preparing to deploy subgraph: ${subgraphName} to ${network}`);

let contractAddresses;
try {
  const addressesPath = path.join(__dirname, '..', 'contract-addresses.json');
  contractAddresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  console.log('Loaded contract addresses:', contractAddresses);
} catch (error) {
  console.error('Error reading contract addresses:', error.message);
  process.exit(1);
}

const subgraphTemplate = path.join(__dirname, '..', 'subgraph', 'subgraph.yaml');
let subgraphConfig = fs.readFileSync(subgraphTemplate, 'utf8');

subgraphConfig = subgraphConfig
  .replace('${SPARK_REGISTRY_ADDRESS}', contractAddresses.sparkRegistry)
  .replace('${REBOUND_MANAGER_ADDRESS}', contractAddresses.reboundManager)
  .replace('${MEDIA_MANAGER_ADDRESS}', contractAddresses.mediaManager)
  .replace('${SOCIAL_GRAPH_ADDRESS}', contractAddresses.socialGraph);

fs.writeFileSync(path.join(__dirname, '..', 'subgraph', 'subgraph.yaml'), subgraphConfig);
console.log('Updated subgraph.yaml with contract addresses');

let deployEndpoint;
if (network === 'localhost') {
  deployEndpoint = 'http:
} else if (network === 'hosted-service') {
  deployEndpoint = 'https:
} else {
  console.error(`Unknown network: ${network}`);
  process.exit(1);
}

if (network === 'hosted-service' && !process.env.GRAPH_ACCESS_TOKEN) {
  console.error('Error: GRAPH_ACCESS_TOKEN environment variable not set.');
  console.error('Run: export GRAPH_ACCESS_TOKEN=your-access-token');
  process.exit(1);
}

console.log('Building subgraph...');
try {
  exec('cd subgraph && graph codegen', { stdio: 'inherit' });
  exec('cd subgraph && graph build', { stdio: 'inherit' });
} catch (error) {
  console.error('Error building subgraph:', error.message);
  process.exit(1);
}

console.log(`Deploying subgraph to ${network}...`);
try {
  if (network === 'localhost') {
    
    try {
      exec(`cd subgraph && graph create ${subgraphName} --node ${deployEndpoint}`, { stdio: 'inherit' });
    } catch (error) {
      
      console.log('Note: Subgraph might already exist, continuing with deployment');
    }

    exec(`cd subgraph && graph deploy ${subgraphName} --ipfs http:
  } else {
    
    exec(`cd subgraph && graph deploy --product hosted-service ${subgraphName}`, { stdio: 'inherit' });
  }
  
  console.log('Deployment successful!');

  const envTemplate = path.join(__dirname, '..', 'frontend', '.env.template');
  const envLocal = path.join(__dirname, '..', 'frontend', '.env.local');
  
  if (fs.existsSync(envTemplate)) {
    let envContent = fs.readFileSync(envTemplate, 'utf8');
    
    if (network === 'localhost') {
      envContent = envContent.replace(
        /NEXT_PUBLIC_GRAPH_API=.*/,
        `NEXT_PUBLIC_GRAPH_API=http:
      );
    } else {
      envContent = envContent.replace(
        /NEXT_PUBLIC_GRAPH_API=.*/,
        `NEXT_PUBLIC_GRAPH_API=https:
      );
    }
    
    fs.writeFileSync(envLocal, envContent);
    console.log(`Updated frontend environment variables in ${envLocal}`);
  }
  
} catch (error) {
  console.error('Error deploying subgraph:', error.message);
  process.exit(1);
}
