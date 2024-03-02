
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const db = require('./config/database');
const routes = require('./router/routes');
const session = require('express-session');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

//const express = require('express');
const router = require('./controllers/authController');


// Autres configurations

// Utilisation de la fonction postRegister dans votre route
app.post("/auth/register", router.postRegister);

// Autres configurations

module.exports = app;

dotenv.config({ path: './.env' });

// Middleware
app.set('view engine', 'hbs');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// Routes
app.use('/', routes);

const PORT = process.env.PORT || 3000
;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});