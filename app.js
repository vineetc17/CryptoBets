const matchesModule = require('./matches.js');
const betModule = require('./bet.js');
const userModule = require('./user.js');
const { Block, MineBlock } = require('./block.js');
const prompt = require('prompt');
const transactionModule = require('./transaction.js');
const crypto = require('crypto');

let matches;
let users;
let transactions = [];
let transactionId = 1; 
let blockchain = [];
initializeBlockchain();

async function main() {
    try {
        // Register matches if not already registered
        if (!matches) {
            matches = await new Promise((resolve, reject) => {
                matchesModule.registerMatches(resolve);
            });
        }

        // Register users if not already registered
        if (!users) {
            users = await new Promise((resolve) => {
                userModule.registerUsers(resolve);
            });
        }
    } catch (error) {
        console.error('Error during initialization:', error);
        throw error; // Rethrow the error to handle it elsewhere if needed
    }
}

async function run(users) {
    while (true) {
        console.log('\nOptions:');
        console.log('1. Enter bet');
        console.log('2. View transactions');
        console.log('3. Create and mine a block');
        console.log('4. View blockchain');
        console.log('5. Exit');

        const { option } = await prompt.get(['option']);
        switch (parseInt(option)) {
            case 1:
                await placeBet();
                break;
            case 2:
                await viewTransactions();
                break;
            case 3:
                await createAndMineBlock(users);
                break;
                case 4:
                    viewBlockchain();
                    break;
                case 5:
                    console.log('Exiting...');
                    return;
                default:
                    console.log('Invalid option.')
        }
    }
}
function viewBlockchain() {
    console.log('Blockchain:');
    console.log(JSON.stringify(blockchain, null, 2));
}
async function start() {
    prompt.start();
    try {
        await main();
        const { userId } = await prompt.get(['userId']); // Get the userId here
        await run(users); // Pass users array to run function
    } catch (error) {
        console.error('Error during execution:', error);
    }
}

async function placeBet() {
    console.log('\nEnter bet details:');
    const { userId, match, team, amount } = await prompt.get(['userId', 'match', 'team', 'amount']);

    const userExists = users.find(user => user.userId === userId);

    if (!userExists) {
        console.log('Error: User not found.');
        return;
    }
    const matchExists = matches.find(m => m.matchNo === match);
        if (!matchExists) {
        console.log('Error: Match not found.');
        return;
    }

    if (matchExists.team1 !== team && matchExists.team2 !== team) {
        console.log('Error: The selected team is not playing in this match.');
        return;
    }

    if (userExists.balance < amount) {
        console.log('Error: Insufficient balance.');
        return;
    }

    const alreadyBet = transactions.some(transaction => transaction.userID === userId && transaction.matchNo === match);
    if (alreadyBet) {
        console.log('Error: You have already placed a bet on this match.');
        return;
    }

    // Deduct the bet amount from the user's balance
    userExists.balance -= amount;

    // Generate challenge and response
    const challenge = generateChallenge();
    const bit = Math.random() < 0.5 ? 0 : 1;
    const secretKey = userExists.privateKey;
    const response = createResponse(challenge, bit, secretKey);

    // Verify response
    const isVerified = verifyResponse(challenge, bit, response, secretKey);

    if (!isVerified) {
        console.log('Transaction verification failed.');
        return;
    }

    const timestamp = new Date().toISOString();
    const transaction = {
        id: transactions.length + 1, // Generate unique ID for the transaction
        userID: userId,
        publicKey: userExists.publicKey, // Assuming publicKey is stored in user object
        matchNo: match,
        teamNo: team,
        betAmount: amount,
        timestamp: timestamp
    };

    // Register bet if the function exists
    if (typeof betModule.registerBet === 'function') {
        betModule.registerBet(transaction, matches, users);
    }

    // Add transaction to transactions array
    transactions.push(transaction);

    console.log('Bet registered:', {
        userID: transaction.userID,
        publicKey: userExists.publicKey,
        matchNo: transaction.matchNo,
        teamNo: transaction.teamNo,
        betAmount: transaction.betAmount
    });
    console.log('Transactions:', transactions);

    if (matchExists.winner === team) {
        // Update user's balance with double the bet amount
        userExists.balance += amount * 2;
        console.log(`Congratulations! You bet on the correct team. Your balance has been updated to ${userExists.balance}.`);
    } else {
        console.log('Sorry, you did not bet on the winning team.');
    }
}

async function viewTransactions() {
    console.log('\nEnter user ID to view transactions:');
    const { userId } = await prompt.get(['userId']);
    const userExists = users.find(user => user.userId === userId);

    if (!userExists) {
        console.log('Error: Incorrect user ID.');
        await viewTransactions(); 
        return;
    }
    const userTransactions = transactions.filter(transaction => transaction.userID === userId);
    console.log('Transactions for user', userId, ':', userTransactions);
}

async function createAndMineBlock(userId) { // Modify the function to accept userId
    console.log('\nCreating block...');
    const previousHash = blockchain.length > 0 ? blockchain[blockchain.length - 1].hash : '0';
    const index = blockchain.length > 0 ? blockchain[blockchain.length - 1].index : '0';

    const block = new Block(Date.now(), transactions.slice(), previousHash, index+1); // Pass the previous hash
    console.log('Block created:', block);

    console.log('\nMining block...');
    const mineBlock = new MineBlock(Date.now(), block.transactions, userId, previousHash, index+1); // Pass userId instead of userIds array
    mineBlock.mineBlock(4, userId); // Pass userId instead of userIds array

    console.log('Block mined successfully:', mineBlock);
    blockchain.push(mineBlock);
    transactions = []; // Clear transactions array
    console.log('Transactions cleared.');
}

function initializeBlockchain() {
    const genesisTimestamp = Date.parse('2009-01-03T18:15:05Z'); // Hardcoded timestamp for the genesis block
    const genesisTransactions = []; // Empty transactions array for the genesis block
    const genesisPreviousHash = '0000000000000000000000000000000000000000000000000000000000000000'; // Hardcoded previous hash for the genesis block
    const genesisNonce = '0'; // Hardcoded nonce for the genesis block
    const genesisHash = '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f'; // Hardcoded hash for the genesis block
    const genesisCoinbaseMessage = 'The Times 03/Jan/2009 Chancellor on brink of second bailout for banks'; // Hardcoded coinbase transaction message for the genesis block

    const genesisBlock = new Block(genesisTimestamp, genesisTransactions, genesisPreviousHash);
    genesisBlock.index = 0; // Set index manually for the genesis block
    genesisBlock.nonce = genesisNonce; // Set nonce manually for the genesis block
    genesisBlock.hash = genesisHash; // Set hash manually for the genesis block

    // Add the coinbase transaction to the genesis block
    genesisBlock.transactions.push({
        id: 'coinbase', // Special ID for the coinbase transaction
        message: genesisCoinbaseMessage,
        timestamp: genesisTimestamp
    });

    blockchain.push(genesisBlock);
}

// Transaction verification functions
function generateChallenge() {
    return crypto.randomBytes(16).toString('hex');
}

function createResponse(challenge, bit, secretKey) {
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(challenge + bit.toString());
    return hmac.digest('hex');
}

function verifyResponse(challenge, bit, response, secretKey) {
    const expectedResponse = createResponse(challenge, bit, secretKey);
    return response === expectedResponse;
}

start();
