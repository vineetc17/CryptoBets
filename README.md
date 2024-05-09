
---

# CryptoBets

This is a cryptographic project that demonstrates blockchain technology and betting functionalities.

## Overview

The project consists of several modules:

- **app.js**: Main entry point of the application.
- **bet.js**: Module for placing bets.
- **block.js**: Contains classes for creating and mining blocks.
- **blockchain.js**: Defines the blockchain structure and mining operations.
- **matches.js**: Handles match-related functionalities.
- **transaction.js**: Manages transactions between users.
- **user.js**: Registers users with their private keys and pre-shared secret.

## Installation

1. Clone the repository.
2. Navigate to the project directory.
3. Install dependencies by running `npm install`.

## Running the Application

1. Run the application using `node app.js`.
2. Follow the prompts to register matches and users.
3. Enter bet details and view transactions as needed.
4. Create and mine blocks to add transactions to the blockchain.
5. View the current blockchain state.

## Functionality

### Blockchain Operations

- **Placing Bets**: Users can enter bet details including the match number, team, and amount. Each bet is recorded as a transaction in the blockchain.
- **Viewing Transactions**: Users can view their transaction history, which is stored in the blockchain.
- **Creating and Mining Blocks**: Blocks are created and mined to add transactions to the blockchain. Mining involves solving cryptographic puzzles to find a valid hash for the block.
- **Viewing Blockchain**: Users can view the current state of the blockchain, which contains a record of all transactions.

### Technical Details

- **HMAC Verification**: Private keys are verified using HMAC (Hash-based Message Authentication Code) with a pre-shared secret. This ensures the integrity and authenticity of transactions.
- **Consensus Algorithm**: The consensus algorithm used in this blockchain is Proof of Work (PoW). In PoW, miners compete to solve computational puzzles, and the first miner to find a valid solution adds a new block to the blockchain. This mechanism ensures the security and immutability of the blockchain.

### Blockchain Structure

- **Block**: Each block in the blockchain contains a timestamp, a list of transactions, a previous hash, and a nonce. The hash of each block is calculated based on these components, ensuring the integrity of the blockchain.
- **Merkle Root**: Transactions within a block are organized into a Merkle tree, and the root of this tree (Merkle root) is included in the block's hash. This allows for efficient verification of block integrity.

## Dependencies

- `prompt`: For user input.
- `crypto`: For cryptographic operations.

---




