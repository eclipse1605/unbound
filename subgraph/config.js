const fs = require('fs');
const path = require('path');

const contractAddresses = JSON.parse(fs.readFileSync(path.join(__dirname, '../contract-addresses.json')));

let yamlContent = fs.readFileSync(path.join(__dirname, 'subgraph.yaml'), 'utf8');
yamlContent = yamlContent.replace('${SPARK_REGISTRY_ADDRESS}', contractAddresses.sparkRegistry);
yamlContent = yamlContent.replace('${REBOUND_MANAGER_ADDRESS}', contractAddresses.reboundManager);
yamlContent = yamlContent.replace('${MEDIA_MANAGER_ADDRESS}', contractAddresses.mediaManager);
yamlContent = yamlContent.replace('${SOCIAL_GRAPH_ADDRESS}', contractAddresses.socialGraph);
yamlContent = yamlContent.replace('${INTERACTION_TRACKER_ADDRESS}', contractAddresses.interactionTracker);

fs.writeFileSync(path.join(__dirname, 'subgraph.yaml'), yamlContent);

console.log('Subgraph configuration updated with contract addresses:');
console.log(JSON.stringify(contractAddresses, null, 2)); 