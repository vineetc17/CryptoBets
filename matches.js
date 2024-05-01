const prompt = require('prompt');

function registerMatches(callback) {
  const matches = [];

  function addMatch() {
    prompt.get(['matchNo', 'team1', 'team2'], (err, result) => {
      if (err) {
        console.error(err);
        return;
      }
      const { matchNo, team1, team2 } = result;
      if (matches.some(match => match.matchNo === matchNo)) {
        console.error("Match with the same ID already exists. Please enter a different match ID.");
        addMatch(); // Prompt again for match details
        return;
      }
      
      if (team1 === team2) {
        console.error("Team 1 and Team 2 cannot be the same. Please enter different teams.");
        addMatch(); // Prompt again for match details
        return;
      }
      const winner = Math.random() < 0.5 ? team1 : team2; // Randomly select winner
      matches.push({ matchNo, team1, team2, winner });

      prompt.get(['continue'], (err, result) => {
        if (result.continue.toLowerCase() === 'yes') {
          addMatch();
        } else {
          displayMatches();
          callback(matches); // Pass matches array to the callback function
        }
      });
    });
  }

  function displayMatches() {
    console.log('Matches entered:');
    matches.forEach(match => {
      console.log(`Match ${match.matchNo}: Team ${match.team1} vs Team ${match.team2}`);
    });
  }

  console.log('Enter match details:');
  addMatch();
}

module.exports = { registerMatches };