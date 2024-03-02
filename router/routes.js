const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const controller = require('../controllers/authController');


router.post('/auth/register',controller.postRegister );
router.get('/register',controller.getRegister );

router.get("/", (req, res) => {
    res.render("index")
});

router.post('/auth/login',controller.postLogin );

router.get('/login',controller.getLogin );
 
router.get('/dashboard', controller.getDashboard);
 

router.get('/logout', controller.logout);
  
router.get("/tableuser",controller.table);


module.exports = router;

