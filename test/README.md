# Unbound Smart Contract Tests

This directory contains the test suite for the Unbound social media platform smart contracts, using Mocha and Chai for testing.

## Structure

- `/test` - Contains all test files
  - `/mocks` - Mock contracts used for isolated testing
  - `helpers.js` - Helper functions for deploying contracts in tests
  - `CommentManager.test.js` - Tests for the CommentManager contract
  - `SparkRegistry.test.js` - Tests for the SparkRegistry contract
  - `ReboundManager.test.js` - Tests for the ReboundManager contract
  - `UnboundIntegration.test.js` - Integration tests across multiple contracts

## Running Tests

To run all tests:

```bash
npm test
```

To run specific test files:

```bash
# Test only CommentManager
npm run test:comment

# Test only SparkRegistry
npm run test:spark

# Test only ReboundManager
npm run test:rebound
```

## Test Coverage

You can generate a test coverage report using:

```bash
npx hardhat coverage
```

This will create a `coverage` directory with a detailed HTML report.

## Writing New Tests

When adding new tests:

1. Keep unit tests focused on a single contract functionality
2. Use the mock contracts for isolated testing
3. Add integration tests for cross-contract interactions
4. Follow the pattern of `describe` blocks for feature grouping and `it` blocks for specific test cases

Example:

```javascript
describe("Feature Name", function() {
  beforeEach(async function() {
    // Setup for this feature
  });

  it("should behave in expected way", async function() {
    // Test specific behavior
  });
});
```

## Mocks

The mock contracts provide simplified implementations for testing isolated functionality:

- `MockUnboundCoordinator.sol` - Simplified coordinator contract
- `MockSparkRegistry.sol` - Simplified registry for testing ReboundManager without dependencies 