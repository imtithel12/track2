// app/controllers/authController.js
const bcrypt = require('bcryptjs');
const db = require('../config/database');
//const listetab = require('../config/database');
const YourModel = require('../models/userModel');
exports.getRegister = (req, res) => {
    res.render('register');
};

exports.postRegister = async (req, res) => {
    const { name, email, password, password_confirm } = req.body;
    // console.log('Received data from the form:', { name, email, password, password_confirm });

    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, result) => {
        if (error) {
            console.log(error);
        }

        if (result.length > 0) {
            return res.render('register', {
                message: 'This email is already in use'
            });
        } else if (password !== password_confirm) {
            console.log('Passwords do not match:', password, password_confirm);
            return res.render('register', {
                message: 'Passwords do not match!'
            });
        }

        let hashedPassword = await bcrypt.hash(password, 8);

        db.query('INSERT INTO users SET ?', { name: name, email: email, password: hashedPassword }, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                //console.log('Users registered successfully!');
                return res.render('register', {
                    message: 'Users registered!'
                });
            }
        });
    });
};


exports.getLogin = (req, res) => {
    res.render('login');
};

exports.postLogin = async (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (error, result) => {
        if (error) {
            console.log(error);
        }

        if (result.length === 0) {
            return res.render('login', {
                message: 'Invalid email or password'
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, result[0].password);

        if (!isPasswordMatch) {
            return res.render('login', {
                message: 'Invalid email or password'
            });
        }

        res.render('dashboard', {
            user: result[0]
        });
    });
}

exports.logout = (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.log(err);
            }
            res.redirect("/");
        });
    } else {
        res.redirect("/");
    }
};

exports.getDashboard = (req, res) => {
    res.render('dashboard');
};

exports.table = (req, res) => {
    try {
      // Fetch all rows from the 'listetab' table
      const query = 'SELECT * FROM users';
  
      db.query(query, (err, results) => {
        if (err) {
          console.error('Error executing MySQL query:', err);
          return res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur.',
          });
        }
  
        // Render a view or send the JSON response, depending on your requirements
        // For JSON response:
        return res.status(200).json({ success: true, liste: results });
  
        // For rendering a view (e.g., using a template engine like EJS or Handlebars):
        // return res.render('yourView', { success: true, liste: results });
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur.',
      });
    }
  };

module.exports = exports;
