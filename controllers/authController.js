// app/controllers/authController.js
const bcrypt = require('bcryptjs');
const db = require('../config/database');

exports.getRegister = (req, res) => {
    res.render('register');
};

exports.postRegister = async (req, res) => {
    const { name, email, password, password_confirm } = req.body;
    // console.log('Received data from the form:', { name, email, password, password_confirm });

    db.query('SELECT email FROM user WHERE email = ?', [email], async (error, result) => {
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

        db.query('INSERT INTO user SET ?', { name: name, email: email, password: hashedPassword }, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                //console.log('User registered successfully!');
                return res.render('register', {
                    message: 'User registered!'
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

    db.query('SELECT * FROM user WHERE email = ?', [email], async (error, result) => {
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

module.exports = exports;
