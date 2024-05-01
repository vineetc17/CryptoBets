const prompt = require('prompt');
const crypto = require('crypto');
const { addTransaction } = require('./transaction'); // Assuming you have a transaction module
const preSharedSecret = 'b3r4z93x71q0'; // Define your pre-shared secret here

function generateRandomKey(length) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex') // convert to hexadecimal format
    .slice(0, length); // return required number of characters
}

function hasPreSharedSecret(privateKey) {
  // Check if the pre-shared secret is contained within the private key
  return privateKey.includes(preSharedSecret);
}

function registerUsers(callback) {
  const users = [];

  function registerUser() {
    prompt.get(['userId', 'privateKey'], (err, result) => {
      if (err) {
        console.error(err);
        return;
      }
      const { userId, privateKey } = result;

      if (users.some(user => user.userId === userId)) {
        console.error("User with the same ID already exists. Please enter a different user ID.");
        registerUser(); // Prompt again for user ID
        return;
      }

      const publicKey = generateRandomKey(64);
      const balance = 10000; // Initial balance for each user (adjust as needed)
      const user = { userId, publicKey, privateKey, balance };
      const hasSecret = hasPreSharedSecret(privateKey);

      if (!hasSecret) {
        console.error(`Wrong private key. Registration aborted.`);
        registerUser(); // Prompt for input again
        return;
      }

      users.push(user);

      // Verify private key using HMAC with pre-shared secret
      const challenge = crypto.randomBytes(16).toString('hex');
      const bit = Math.random() < 0.5 ? 0 : 1;
      // console.log('Challenge:', challenge);
      // console.log('Bit:', bit);
      // console.log('Secret Key:', privateKey);
      const response = createResponse(challenge, bit, privateKey, preSharedSecret);
      //console.log('Response:', response);
      const isVerified = verifyResponse(challenge, bit, response, privateKey, preSharedSecret);

      if (isVerified) {
        console.log(`Verified successfully. You can proceed`);
      } else {
        console.error(`Private key verification failed for user ${userId}. Registration aborted.`);
        // Remove the user from the list if verification fails
        const index = users.findIndex(u => u.userId === userId);
        if (index !== -1) {
          users.splice(index, 1);
        }
        //return; // Stop registration process for this user
        registerUser();
      }

      prompt.get(['continue'], (err, result) => {
        if (result.continue.toLowerCase() === 'yes') {
          registerUser();
        } else {
          console.log('Users registered:');
          users.forEach(user => {
            console.log(`User ID: ${user.userId}, Public Key: ${user.publicKey}, Balance: ${user.balance}`);
          });
          callback(users);
        }
      });
    });
  }

  console.log('Enter user IDs and private keys:');
  registerUser();
}

// Transaction verification functions
function createResponse(challenge, bit, secretKey, preSharedSecret) {
  const hmac = crypto.createHmac('sha256', preSharedSecret);
  hmac.update(challenge + bit.toString() + secretKey);
  return hmac.digest('hex');
}

function verifyResponse(challenge, bit, response, secretKey, preSharedSecret) {
  const expectedResponse = createResponse(challenge, bit, secretKey, preSharedSecret);
  //console.log('Expected Response:', expectedResponse);
  return response === expectedResponse;
}

module.exports = { registerUsers };
