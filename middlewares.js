// middlewares.js
const session = require('express-session');

// Middleware pour vérifier l'authentification de l'utilisateur
const authMiddleware = (req, res, next) => {
    if (req.session && req.session.user) {
        // Si l'utilisateur est authentifié, passez à la prochaine étape
        next();
    } else {
        // Si l'utilisateur n'est pas authentifié, redirigez-le vers la page de connexion
        res.redirect('/login');
    }
};

module.exports = {
    authMiddleware
};
