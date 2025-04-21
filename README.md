# Unbound

Unbound is a decentralized, Web3-enabled microblogging platform inspired by Twitter. Built on blockchain and decentralized protocols, Unbound empowers users to broadcast brief messages called Sparks, interact with content through reposting (Rebound), follow peers using the Orbit feature, and engage in a community-governed social experience.

## Project Structure

- `contracts/`: Smart contracts that power the Unbound platform
- `frontend/`: Next.js frontend application
- `scripts/`: Deployment and utility scripts
- `subgraph/`: The Graph protocol subgraph for indexing events
- `test/`: Smart contract tests

## Features

- **Sparks**: Create short messages that are stored on the blockchain
- **Rebounds**: Repost content with optional comments
- **Orbits**: Follow other users to see their content in your feed
- **Interactions**: Like and comment on Sparks
- **Media Support**: Upload and attach media to your Sparks

## Prerequisites

- Node.js (v16+)
- npm or yarn
- Hardhat
- MetaMask or another Web3 wallet

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/unbound.git
cd unbound
```

2. Install dependencies for the smart contracts:

```bash
npm install
```

3. Install dependencies for the frontend:

```bash
cd frontend
npm install
cd ..
```

## Environment Configuration

1. Create a `.env` file in the project root with the following variables:

```
DEVELOPER_ADDRESS=your_wallet_address
FUND_AMOUNT=100
ETHERSCAN_API_KEY=your_etherscan_api_key
PINATA_API_KEY=your_pinata_api_key
```

2. Create a `.env.local` file in the frontend directory with:

```
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://localhost:8545
```

## Development

### Smart Contracts

1. Start a local Ethereum node:

```bash
npm run node
```

2. In a new terminal, deploy the contracts to the local network:

```bash
npm run deploy
```

3. Run tests:

```bash
npm test
```

### Frontend

1. Start the development server:

```bash
npm run dev
```

2. Open your browser and navigate to `http://localhost:3000`

## Code Cleanup

The project includes a script to remove unnecessary comments from code files:

```bash
node scripts/clean-comments.js
```

This script:
- Removes comments from JavaScript, TypeScript, CSS, and other frontend files
- Preserves comments in Solidity (.sol) files
- Preserves JSDoc-style documentation comments

## Deployment

### Smart Contracts

Deploy to a testnet (e.g., Sepolia):

```bash
npm run deploy:testnet
```

### Frontend

1. Build the frontend:

```bash
cd frontend
npm run build
```

2. Deploy to your hosting service of choice (Vercel, Netlify, etc.)

### Subgraph

1. Initialize and deploy the subgraph:

```bash
cd subgraph
npm run codegen
npm run build
npm run deploy
```

## Technical Stack

- **Smart Contracts**: Solidity, Hardhat
- **Frontend**: Next.js, React, ethers.js
- **Styling**: Tailwind CSS
- **Blockchain**: Ethereum, The Graph
- **Storage**: IPFS for decentralized content storage

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.
