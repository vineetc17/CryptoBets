// transaction.js

const crypto = require('crypto');

class Transaction {
  constructor(id, userId, publicKey, matchNo, teamNo, betAmount, timestamp) {
    this.id = id;
    this.userId = userId;
    this.publicKey = publicKey;
    this.matchNo = matchNo;
    this.teamNo = teamNo;
    this.betAmount = betAmount;
    this.timestamp = timestamp || new Date().toISOString();
  }
}

const transactions = [];
let transactionId = 1;

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

function addTransaction(userId, publicKey, privateKey, matchNo, teamNo, betAmount) {
  const challenge = generateChallenge();
  const bit = Math.random() < 0.5 ? 0 : 1;
  const secretKey = privateKey; // Use private key as secret key
  
  const response = createResponse(challenge, bit, secretKey);
  const isVerified = verifyResponse(challenge, bit, response, secretKey);

  if (isVerified) {
    const transaction = new Transaction(transactionId++, userId, publicKey, matchNo, teamNo, betAmount);
    transactions.push(transaction);
  } else {
    console.error('Transaction verification failed');
  }
}

function createTransactions(bets, users) {
  bets.forEach(bet => {
    const user = users.find(user => user.userId === bet.userId);
    if (user) {
      addTransaction(bet.userId, user.publicKey, user.privateKey, bet.matchNo, bet.teamNo, bet.betAmount);
    } else {
      console.error('User not found for bet:', bet);
    }
  });

  console.log('Transactions verified');
  console.log('Transactions created');
  console.log(transactions);
  return transactions;
}

module.exports = { addTransaction, createTransactions };
