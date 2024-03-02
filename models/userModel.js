// models/userModel.js
const db = require('../config/database'); // Adjust the path accordingly



const YourModel = {
  getAll: (callback) => {
    db.query('SELECT * FROM users', (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
  },
  // Add other model methods as needed
};

module.exports = YourModel;

