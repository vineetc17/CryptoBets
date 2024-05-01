const crypto = require('crypto');

class Block {
  constructor(timestamp, transactions, previousHash = '', index = 0) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0; // Used only in mineBlock function to generate new Hash
    this.merkelHash = this.merkelRoot();
  }

  calculateHash() {
    return crypto.createHash('sha256').update(this.timestamp + this.merkelHash + this.previousHash + JSON.stringify(this.transactions) + this.nonce).digest('hex');
  }

  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log("Block mined:", this.hash);
  }

  merkelRoot() {
    const leafNodes = this.transactions.length;
    let nodePerItr = leafNodes;
    let nodeArr = [];
    let low = 0;
    let h = low + 1;
    let i = 0;
    let j = 0;
    while (j < leafNodes) {
      nodeArr[j] = this.transactions[j].hash;
      j++;
    }
    while (nodePerItr > 1) {
      if (nodePerItr % 2 == 0) {
        while (h <= nodePerItr - 1) {
          nodeArr[i] = crypto.createHash('sha256').update(nodeArr[low] + nodeArr[h] + Date.now()).digest('hex');
          low = h + 1;
          h = low + 1;
          i++;
        }
        nodePerItr = nodePerItr / 2;
      } else {
        while (h <= nodePerItr - 1) {
          nodeArr[i] = crypto.createHash('sha256').update(nodeArr[low] + nodeArr[h] + Date.now()).digest('hex');
          low = h + 1;
          h = low + 1;
          i++;
          if (low == nodePerItr - 1) {
            h = low;
            continue;
          }
        }
        nodePerItr = (nodePerItr + 1) / 2;
      }
    }
    if (this.index != 0) {
      console.log("Merkel Hash:", nodeArr[0]);
    }
    return nodeArr[0];
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 4;
    this.miningReward = 100;
    this.pendingTransactions = [];
  }

  createGenesisBlock() {
    return new Block(Date.now(), "Genesis Block", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    this.pendingTransactions.push(new Transaction(null, miningRewardAddress, this.miningReward, Date.now()));

    let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);

    block.index = this.chain.length;
    this.chain.push(block);
    this.pendingTransactions = [];
  }

  printBlockchain() {
    console.log(this.chain);
  }

  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress)
      throw new Error("Transaction must have from and to address");

    if (!transaction.isValid())
      throw new Error("Cannot add invalid transaction to chain");

    this.pendingTransactions.push(transaction);
  }
}

module.exports = { Block, Blockchain };
