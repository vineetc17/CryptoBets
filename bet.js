// bet.js

const prompt = require('prompt');
const { addTransaction } = require('./transaction');

function registerBets(matches, users, callback) {
  const bets = [];

  function registerBet() {
    prompt.get(['userId', 'matchNo', 'teamNo', 'betAmount'], (err, result) => {
      if (err) {
        console.error(err);
        return;
      }
      const { userId, matchNo, teamNo, betAmount } = result;
      const user = users.find(user => user.userId === userId);
      if (!user) {
        console.error('User not found.');
        return;
      }
      const match = matches.find(match => match.matchNo === matchNo);
      if (!match) {
        console.error('Match not found.');
        return;
      }
      bets.push({ userId, publicKey: user.publicKey, matchNo, teamNo, betAmount });

      prompt.get(['continue'], (err, result) => {
        if (result.continue.toLowerCase() === 'yes') {
          registerBet();
        } else {
          console.log('Bets registered:');
          console.log(bets);
          callback(bets);
        }
      });
    });
  }

  console.log('Enter bet details:');
  registerBet();
}

module.exports = { registerBets };
