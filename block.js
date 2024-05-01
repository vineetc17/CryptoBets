const crypto = require('crypto');

class Block {
    constructor(timestamp, transactions, previousHash, index) {
        this.index = index;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
    }
}

class MineBlock {
    constructor(timestamp, transactions,userId, previousHash, index) {
        this.index = index;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        //this.userId = userId;
        this.merkelHash = this.calculateMerkleRoot(transactions); // Calculate merkelHash here
        this.hash = this.calculateHash();
        this.nonce = 0; // Used only in mineBlock function to generate new Hash
    }
    calculateMerkleRoot(transactions) {
        if (transactions.length === 0) {
            return null;
        }
        let transactionHashes = transactions.map(tx => {
            let transactionData = `${tx.id}${tx.userId}${tx.publicKey}${tx.matchNo}${tx.teamNo}${tx.betAmount}${tx.timestamp}`;
            return crypto.createHash('sha256').update(transactionData).digest('hex');
        });

        while (transactionHashes.length > 1) {
            if (transactionHashes.length % 2 !== 0) {
                transactionHashes.push(transactionHashes[transactionHashes.length - 1]);
            }
            let newHashes = [];
            for (let i = 0; i < transactionHashes.length; i += 2) {
                let combinedHash = crypto.createHash('sha256').update(transactionHashes[i] + transactionHashes[i + 1]).digest('hex');
                newHashes.push(combinedHash);
            }
            transactionHashes = newHashes;
        }
    
        return transactionHashes[0];
    }  
    
    mineBlock(difficulty, users) {
        let startTime = new Date().getTime();
        let winner = null;
        let minTime = Infinity;
    
        for (let user of users) {
            let startTimeUser = new Date().getTime();
            this.nonce = 0; // Reset nonce for each user
        this.hash = this.calculateHash(); // Reset hash for each user
            while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
                this.nonce++;
                this.hash = this.calculateHash();
            }
            let endTimeUser = new Date().getTime();
            let userTime = endTimeUser - startTimeUser;
            console.log(`\nUser ${user.userId} mined the block in ${userTime} milliseconds.`); 
            if (userTime < minTime) {
                minTime = userTime;
                winner = user.userId; 
            }
        }
    
        let endTime = new Date().getTime();
        console.log(`\nWinner of the mining competition: User ${winner}\n`);
    }
    
    

  calculateHash() {
    return crypto.createHash('sha256').update(this.timestamp + this.merkelHash + this.previousHash + JSON.stringify(this.transactions) + this.nonce).digest('hex');
  }
}

module.exports = { Block, MineBlock };