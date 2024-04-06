const bcrypt = require('bcryptjs');
const db = require('../config/database');
const util = require('util');

const fs = require('fs');
const path = require('path');

const mysql = require('mysql2/promise');

const nodemailer = require('nodemailer');


let loggedInClientId = null;

exports.getInscrire = (req, res) => {
    return res.render('inscrire');
};

exports.postInscrire = async (req, res) => {
    const { nom, prenom, username, email, password, password_confirm } = req.body;

    // Vérifier si mail est utilisé dans la base de données
    db.query('SELECT * FROM clients WHERE email = ?', [email], async (error, result) => {
        if (error) {
            console.log(error);
            return res.render('inscrire', {
                message: 'An error occurred while checking email availability'
            });
        }

        if (result.length > 0) {
            return res.render('inscrire', {
                message: 'This email is already in use!'
            });
        }

        // Vérifier si les mots de passe correspondent
        if (password !== password_confirm) {
            return res.render('inscrire', {
                message: 'Passwords do not match!'
            });
        }

        // Hasher le mot de passe avant de l'insérer dans la base de données
        const hashedPassword = await bcrypt.hash(password, 8);

        // Insérer les données dans la table 'clients'
        db.query('INSERT INTO clients (nom, prenom, username, email, password) VALUES (?, ?, ?, ?, ?)', [nom, prenom, username, email, hashedPassword], (err, result) => {
            if (err) {
                console.log(err);
                return res.render('inscrire', {
                    message: 'Error occurred while registering the client!'
                });
            } else {
                // Rediriger vers la page de connexion
                return res.redirect('/connecter');
            }
        });
    });
};
////////////////////////////////////////////////////////////////////////////////////////

exports.getConnecter = (req, res) => {
    return res.render('connecter');
};

exports.postConnecter = async (req, res) => {
    const { email, password } = req.body;

    // Recherche dans la table 'clients'
    db.query('SELECT * FROM clients WHERE email = ?', [email], async (error, clientResult) => {
        if (error) {
            console.error(error);
            return res.render('connecter', {
                message: 'Une erreur s\'est produite lors de la vérification de l\'email'
            });
        }

        if (clientResult.length === 0) {
            // Si l'email n'est pas trouvé dans la table 'clients', vérifie dans la table 'administrateurs'
            db.query('SELECT * FROM administrateurs WHERE email = ?', [email], async (error, adminResult) => {
                if (error) {
                    console.error(error);
                    return res.render('connecter', {
                        message: 'Une erreur s\'est produite lors de la vérification de l\'email'
                    });
                }

                if (adminResult.length === 0) {
                    // Si l'email ne correspond à aucun utilisateur
                    return res.render('connecter', {
                        message: 'Email incorrect!'
                    });
                }

                // Rediriger l'administrateur vers la page des clients
                return res.redirect('/clients');
            });
        } else {
            // Si l'email correspond à un client, vérifie le mot de passe
            const isPasswordMatch = await bcrypt.compare(password, clientResult[0].password);

            if (!isPasswordMatch) {
                return res.render('connecter', {
                    message: 'Mot de passe incorrect!'
                });
            }

            // Stocker l'ID du client connecté
            loggedInClientId = clientResult[0].id;

            // Rediriger le client vers la page pour ajouter une URL
            return res.redirect('/addurl');
        }
    });
};
/////////////////////////////////////////////////////////////////////////////////////////////////
// exports.forgotPassword = async (req, res) => {
//     const { email } = req.body;

//     // Recherche dans la table 'clients'
//     db.query('SELECT * FROM clients WHERE email = ?', [email], async (error, clientResult) => {
//         if (error) {
//             console.error(error);
//             return res.render('forgotPassword', {
//                 message: 'Une erreur s\'est produite lors de la vérification de l\'email'
//             });
//         }

//         if (clientResult.length === 0) {
//             // Si l'email n'est pas trouvé dans la table 'clients', vérifie dans la table 'administrateurs'
//             db.query('SELECT * FROM administrateurs WHERE email = ?', [email], async (error, adminResult) => {
//                 if (error) {
//                     console.error(error);
//                     return res.render('forgotPassword', {
//                         message: 'Une erreur s\'est produite lors de la vérification de l\'email'
//                     });
//                 }

//                 if (adminResult.length === 0) {
//                     // Si l'email ne correspond à aucun utilisateur
//                     return res.render('forgotPassword', {
//                         message: 'Aucun utilisateur trouvé avec cet email!'
//                     });
//                 }

//                 // Si l'email correspond à un administrateur, vous pouvez implémenter une logique appropriée ici
//                 // Par exemple, envoyer un e-mail à l'administrateur pour réinitialiser son mot de passe
//                 return res.render('forgotPassword', {
//                     message: 'Un e-mail de réinitialisation de mot de passe a été envoyé à votre adresse e-mail.'
//                 });
//             });
//         } else {
//             // Si l'email correspond à un client, vous pouvez implémenter une logique appropriée ici
//             // Par exemple, générer un jeton de réinitialisation de mot de passe et l'envoyer à l'utilisateur par e-mail
//             // Pour l'exemple, je vais simplement afficher un message indiquant que l'e-mail a été envoyé.
//             return res.render('forgotPassword', {
//                 message: 'Un e-mail de réinitialisation de mot de passe a été envoyé à votre adresse e-mail.'
//             });
//         }
//     });
// };

// exports.forgotPassword = async (req, res) => {
//     const { email } = req.body;

//     try {
//         // Recherche dans la table 'clients'
//         const [clientRows] = await db.query('SELECT * FROM clients WHERE email = ?', [email]);

//         if (clientRows.length > 0) {
//             // Si l'email correspond à un client
//             // Implémentez la logique appropriée pour la réinitialisation du mot de passe pour le client ici
//             // Par exemple, générez un jeton de réinitialisation du mot de passe et envoyez un e-mail au client
//         } else {
//             // Si l'email n'est pas trouvé dans la table 'clients', vérifie dans la table 'administrateurs'
//             const [adminRows] = await db.query('SELECT * FROM administrateurs WHERE email = ?', [email]);

//             if (adminRows.length > 0) {
//                 // Si l'email correspond à un administrateur
//                 // Implémentez la logique appropriée pour la réinitialisation du mot de passe pour l'administrateur ici
//                 // Par exemple, envoyez un e-mail à l'administrateur pour réinitialiser son mot de passe
//             } else {
//                 // Si l'email ne correspond à aucun utilisateur
//                 return res.render('forgotPassword', {
//                     message: 'Aucun utilisateur trouvé avec cet email!'
//                 });
//             }
//         }

//         // Configuration du transporteur Nodemailer pour envoyer des e-mails
//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: 'imtithelbh7@gmail.com', // Adresse e-mail à partir de laquelle les e-mails seront envoyés
//                 pass: 'votre_mot_de_passe' // Mot de passe de l'adresse e-mail
//             }
//         });

//         // Options de l'e-mail à envoyer
//         const mailOptions = {
//             from: 'imtithelbh7@gmail.com', // Adresse e-mail à partir de laquelle l'e-mail sera envoyé
//             to: email, // Adresse e-mail du destinataire (client)
//             subject: 'Réinitialisation de mot de passe', // Objet de l'e-mail
//             text: 'Voici le lien pour réinitialiser votre mot de passe : https://votre_site.com/reset-password?token=votre_token&email=' + email // Corps de l'e-mail avec le lien de réinitialisation du mot de passe
//         };

//         // Envoi de l'e-mail
//         transporter.sendMail(mailOptions, function (error, info) {
//             if (error) {
//                 console.error(error);
//                 return res.render('forgotPassword', {
//                     message: 'Une erreur s\'est produite lors de l\'envoi de l\'e-mail de réinitialisation de mot de passe!'
//                 });
//             } else {
//                 console.log('Email sent: ' + info.response);
//                 return res.render('forgotPassword', {
//                     message: 'Un e-mail de réinitialisation de mot de passe a été envoyé à votre adresse e-mail.'
//                 });
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         return res.render('forgotPassword', {
//             message: 'Une erreur s\'est produite lors de la réinitialisation de mot de passe!'
//         });
//     }
// };

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    // Recherche dans la table 'clients'
    db.query('SELECT * FROM clients WHERE email = ?', [email], async (error, clientResult) => {
        if (error) {
            console.error(error);
            return res.render('forgotPassword', {
                message: 'Une erreur s\'est produite lors de la vérification de l\'email'
            });
        }

        if (clientResult.length === 0) {
            // Si l'email n'est pas trouvé dans la table 'clients', vérifie dans la table 'administrateurs'
            db.query('SELECT * FROM administrateurs WHERE email = ?', [email], async (error, adminResult) => {
                if (error) {
                    console.error(error);
                    return res.render('forgotPassword', {
                        message: 'Une erreur s\'est produite lors de la vérification de l\'email'
                    });
                }

                if (adminResult.length === 0) {
                    // Si l'email ne correspond à aucun utilisateur
                    return res.render('forgotPassword', {
                        message: 'Aucun utilisateur trouvé avec cet email!'
                    });
                }

                // Si l'email correspond à un administrateur, vous pouvez implémenter une logique appropriée ici
                // Par exemple, envoyer un e-mail à l'administrateur pour réinitialiser son mot de passe
                return res.render('forgotPassword', {
                    message: 'Un e-mail de réinitialisation de mot de passe a été envoyé à votre adresse e-mail.'
                });
            });
        } else {
            // Si l'email correspond à un client, vous pouvez implémenter une logique appropriée ici
            // Par exemple, générer un jeton de réinitialisation de mot de passe et l'envoyer à l'utilisateur par e-mail

            // Configuration du transporteur Nodemailer pour envoyer des e-mails
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                logger: true,
                debug: true,
                auth: {
                    user: 'imtithelbh7@gmail.com', // Adresse e-mail à partir de laquelle les e-mails seront envoyés
                    pass: 'Yarabyarab123@' // Mot de passe de l'adresse e-mail
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            // Options de l'e-mail à envoyer
            const mailOptions = {
                from: 'imtithelbh7@gmail.com', // Adresse e-mail à partir de laquelle l'e-mail sera envoyé
                to: email, // Adresse e-mail du destinataire (client)
                subject: 'Réinitialisation de mot de passe', // Objet de l'e-mail
                text: 'Voici le lien pour réinitialiser votre mot de passe : https://votre_site.com/reset-password?token=votre_token&email=' + email // Corps de l'e-mail avec le lien de réinitialisation du mot de passe
            };

            // Envoi de l'e-mail
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.error(error);
                    return res.render('forgotPassword', {
                        message: 'Une erreur s\'est produite lors de l\'envoi de l\'e-mail de réinitialisation de mot de passe!'
                    });
                } else {
                    console.log('Email sent: ' + info.response);
                    return res.render('forgotPassword', {
                        message: 'Un e-mail de réinitialisation de mot de passe a été envoyé à votre adresse e-mail.'
                    });
                }
            });
        }
    });
};


///////////////////////////////////////////////////////////////////////////////////////////////

exports.getAllClients = (req, res) => {
    // Récupérer tous les clients à partir de la base de données
    db.getAllClients((err, clients) => {
        if (err) {
            // Gérer les erreurs de récupération des clients
            return res.status(500).send("Error retrieving clients");
        }
        // Rendre la vue avec les clients récupérés
        res.render('clients', { clients: clients });
    });
};
//////////////////////////////////////////////////////////////////////////////////////////////
exports.getUrls = (req, res) => {
    // Sélectionner toutes les URLs de la base de données
    db.query('SELECT * FROM urls', (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).render('error', {
                message: 'Une erreur s\'est produite lors de la récupération des URLs.'
            });
        }

        // Rendre une vue pour afficher les URLs récupérées
        res.render('urls', { urls: results });
    });
};
///////////////////////////////////////////////////////////////////////////////////////////////

exports.getProfile = (req, res) => {
    if (!loggedInClientId) {
        return res.redirect('/connecter');
    }

    // Recherche du profil du client et de la première lettre du nom d'utilisateur dans la base de données
    db.query('SELECT *, UPPER(SUBSTRING(username, 1, 1)) AS first_letter FROM clients WHERE id = ?', [loggedInClientId], (error, results) => {
        if (error) {
            console.error(error);
            return res.render('error', {
                message: 'Une erreur s\'est produite lors de la récupération du profil du client'
            });
        }

        if (results.length === 0) {
            return res.render('error', {
                message: 'Profil du client non trouvé'
            });
        }

        // Sélectionner les URL du client connecté à partir de la base de données
        db.query('SELECT * FROM urls WHERE client_id = ?', [loggedInClientId], (error, urlResults) => {
            if (error) {
                console.error(error);
                return res.status(500).render('error', {
                    message: 'Une erreur s\'est produite lors de la récupération des URLs du client.'
                });
            }

            // Afficher le profil du client avec les URLs associées
            res.render('profile', { client: results[0], urls: urlResults });
        });
    });
};
///////////////////////////////////////////////////////////////////////////////////////////////

exports.getUpdateProfile = (req, res) => {
    if (!loggedInClientId) {
        return res.redirect('/connecter');
    }

    // Recherche du profil du client et de la première lettre du nom d'utilisateur dans la base de données
    db.query('SELECT *, UPPER(SUBSTRING(username, 1, 1)) AS first_letter FROM clients WHERE id = ?', [loggedInClientId], (error, results) => {
        if (error) {
            console.error(error);
            return res.render('error', {
                message: 'Une erreur s\'est produite lors de la récupération du profil du client'
            });
        }

        if (results.length === 0) {
            return res.render('error', {
                message: 'Profil du client non trouvé'
            });
        }

        // Sélectionner les URL du client connecté à partir de la base de données
        db.query('SELECT * FROM urls WHERE client_id = ?', [loggedInClientId], (error, urlResults) => {
            if (error) {
                console.error(error);
                return res.status(500).render('error', {
                    message: 'Une erreur s\'est produite lors de la récupération des URLs du client.'
                });
            }

            // Afficher le profil du client avec les URLs associées
            res.render('updateprofile', { client: results[0], urls: urlResults });
        });
    });
};

exports.postUpdateProfile = (req, res) => {
    const { nom, prenom, username, email } = req.body;

    // Mettre à jour les détails du client dans la base de données
    db.query(
        'UPDATE clients SET nom = ?, prenom = ?, username = ?, email = ? WHERE id = ?',
        [nom, prenom, username, email, loggedInClientId],
        (err) => {
            if (err) {
                return res.status(500).send(err);
            }

            // Rediriger vers la page du profil après la mise à jour réussie
            res.redirect('/profile');
        }
    );
};
/////////////////////////////////////////////////////////////////////////////////////////////
exports.getUpdateProfilePassword = (req, res) => {
    if (!loggedInClientId) {
        return res.redirect('/connecter');
    }

    // Recherche du profil du client et de la première lettre du nom d'utilisateur dans la base de données
    db.query('SELECT *, UPPER(SUBSTRING(username, 1, 1)) AS first_letter FROM clients WHERE id = ?', [loggedInClientId], (error, results) => {
        if (error) {
            console.error(error);
            return res.render('error', {
                message: 'Une erreur s\'est produite lors de la récupération du profil du client'
            });
        }

        if (results.length === 0) {
            return res.render('error', {
                message: 'Profil du client non trouvé'
            });
        }

        // Sélectionner les URL du client connecté à partir de la base de données
        db.query('SELECT * FROM urls WHERE client_id = ?', [loggedInClientId], (error, urlResults) => {
            if (error) {
                console.error(error);
                return res.status(500).render('error', {
                    message: 'Une erreur s\'est produite lors de la récupération des URLs du client.'
                });
            }

            // Afficher le profil du client avec les URLs associées
            res.render('updateprofilepassword', { client: results[0], urls: urlResults });
        });
    });
};

exports.postUpdateProfilePassword = async (req, res) => {
    const { old_password, new_password, confirm_new_password } = req.body;

    // Recherche du mot de passe actuel du client
    db.query('SELECT password FROM clients WHERE id = ?', [loggedInClientId], async (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).render('error', {
                message: 'Une erreur s\'est produite lors de la récupération du mot de passe'
            });
        }

        const currentPassword = results[0].password;

        // Vérification de la correspondance entre l'ancien mot de passe fourni et le mot de passe actuel
        const isPasswordMatch = await bcrypt.compare(old_password, currentPassword);

        if (!isPasswordMatch) {
            return res.render('updateprofilepassword', {
                message: 'L\'ancien mot de passe est incorrect!'
            });
        }

        // Vérification si le nouveau mot de passe correspond à la confirmation
        if (new_password !== confirm_new_password) {
            return res.render('updateprofilepassword', {
                message: 'Le nouveau mot de passe et sa confirmation ne correspondent pas!'
            });
        }

        // Hasher le nouveau mot de passe
        const hashedNewPassword = await bcrypt.hash(new_password, 8);

        // Mettre à jour le mot de passe dans la base de données
        db.query(
            'UPDATE clients SET password = ? WHERE id = ?',
            [hashedNewPassword, loggedInClientId],
            (err) => {
                if (err) {
                    return res.status(500).render('error', {
                        message: 'Une erreur s\'est produite lors de la mise à jour du mot de passe'
                    });
                }

                // Redirection vers la page de profil après la mise à jour réussie
                res.redirect('/profile');
            }
        );
    });
};

exports.getAddUrl = (req, res) => {
    if (!loggedInClientId) {
        return res.redirect('/connecter');
    }

    // Recherche du profil du client dans la base de données
    db.query('SELECT UPPER(SUBSTRING(username, 1, 1)) AS first_letter FROM clients WHERE id = ?', [loggedInClientId], (error, results) => {
        if (error) {
            console.error(error);
            return res.render('error', {
                message: 'Une erreur s\'est produite lors de la récupération du profil du client'
            });
        }

        if (results.length === 0) {
            return res.render('error', {
                message: 'Profil du client non trouvé'
            });
        }

        // Sélectionner les URL du client connecté à partir de la base de données
        db.query('SELECT * FROM urls WHERE client_id = ?', [loggedInClientId], (error, urlResults) => {
            if (error) {
                console.error(error);
                return res.status(500).render('error', {
                    message: 'Une erreur s\'est produite lors de la récupération des URLs du client.'
                });
            }

            // Afficher le profil du client avec les URLs associées
            res.render('add_url', { client: results[0], urls: urlResults });
        });
    });
};

// exports.postAddUrl = (req, res) => {
//     const { titre, url } = req.body;
//     const clientId = loggedInClientId; // Utilisez l'ID du client connecté

//     // Vérifiez si l'URL est présente
//     if (!url) {
//         return res.status(400).render('add_url', {
//             message: 'Veuillez fournir une URL.'
//         });
//     }

//     // Ajoutez l'URL dans la base de données
//     db.query('INSERT INTO urls (client_id, titre, url) VALUES (?, ?, ?)', [clientId, titre, url], (error, result) => {
//         if (error) {
//             console.error(error);
//             return res.status(500).render('add_url', {
//                 message: 'Une erreur s\'est produite lors de l\'ajout de l\'URL.'
//             });
//         }

//         // Redirigez vers la page addurl
//         res.redirect('/script');
//     });
// };
///////////////////////////////////////////////////////////////////////////////////////////////

function generateUniqueId() {
    // Code pour générer un identifiant unique, par exemple avec un module Node.js comme 'uuid'
    const uuid = require('uuid');
    return uuid.v4(); // Génère un identifiant UUID (Universally Unique Identifier) aléatoire
}

// exports.postAddUrl = (req, res) => {
//     const { titre, url } = req.body;
//     const clientId = loggedInClientId; // Utilisez l'ID du client connecté

//     // Vérifiez si l'URL est présente
//     if (!url) {
//         return res.status(400).render('add_url', {
//             message: 'Veuillez fournir une URL.'
//         });
//     }

//     // Générer un identifiant de suivi unique pour cette URL
//     const trackingId = generateUniqueId();

//     // Générer le code de suivi unique pour cette URL
//     const urlScript = `<script src="userActivityTracker.js?trackingId=${trackingId}"></script>`;

//     // Insérer l'URL dans la base de données avec le code de suivi
//     db.query('INSERT INTO urls (client_id, titre, url, url_script, tracking_id) VALUES (?, ?, ?, ?, ?)', [clientId, titre, url, urlScript, trackingId], (error, result) => {
//         if (error) {
//             console.error(error);
//             return res.status(500).render('add_url', {
//                 message: 'Une erreur s\'est produite lors de l\'ajout de l\'URL.'
//             });
//         }

//         // Redirigez vers la page addurl
//         res.redirect('/script');
//     });
// };

exports.postAddUrl = (req, res) => {
    const { titre, url } = req.body;
    const clientId = loggedInClientId; // Utilisez l'ID du client connecté

    // Vérifiez si l'URL est présente
    if (!url) {
        return res.status(400).render('add_url', {
            message: 'Veuillez fournir une URL.'
        });
    }

    // Vérifiez si l'URL existe déjà dans la base de données
    db.query('SELECT * FROM urls WHERE url = ?', [url], (selectError, selectResults) => {
        if (selectError) {
            console.error(selectError);
            return res.status(500).render('add_url', {
                message: 'Une erreur s\'est produite lors de la vérification de l\'existence de l\'URL.'
            });
        }

        // Si l'URL existe déjà, redirigez avec un message d'erreur
        if (selectResults.length > 0) {
            return res.status(400).render('add_url', {
                message: 'Cette URL existe déjà.'
            });
        }

        // Générer un identifiant de suivi unique pour cette URL
        const trackingId = generateUniqueId();

        // Générer le code de suivi unique pour cette URL
        const urlScript = `<script src="userActivityTracker.js?trackingId=${trackingId}"></script>`;

        // Insérer l'URL dans la base de données avec le code de suivi
        db.query('INSERT INTO urls (client_id, titre, url, url_script, tracking_id) VALUES (?, ?, ?, ?, ?)', [clientId, titre, url, urlScript, trackingId], (insertError, insertResult) => {
            if (insertError) {
                console.error(insertError);
                return res.status(500).render('add_url', {
                    message: 'Une erreur s\'est produite lors de l\'ajout de l\'URL.'
                });
            }

            // Redirigez vers la page addurl
            res.redirect('/script');
        });
    });
};


exports.deleteUrl = (req, res) => {
    const urlId = req.params.id; // Récupérer l'ID de l'URL à supprimer depuis les paramètres de la requête

    // Vérifier si l'URL appartient au client connecté
    db.query('SELECT * FROM urls WHERE id = ? AND client_id = ?', [urlId, loggedInClientId], (error, urlResult) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: "Une erreur s'est produite lors de la suppression de l'URL." });
        }

        // Vérifier si l'URL existe et appartient au client connecté
        if (urlResult.length === 0) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer cette URL." });
        }

        // Exécuter la requête pour supprimer l'URL de la base de données
        db.query('DELETE FROM urls WHERE id = ?', [urlId], (error, result) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: "Une erreur s'est produite lors de la suppression de l'URL." });
            }

            // Redirection vers une page appropriée après la suppression réussie
            res.redirect('/profile'); // Vous pouvez rediriger vers la page du profil ou toute autre page souhaitée
        });
    });
};

///////////////////////////////////////////////////////////////////////////////////////////////

exports.getScript = (req, res) => {
    if (!loggedInClientId) {
        return res.redirect('/connecter');
    }

    // Recherche du profil du client dans la base de données
    db.query('SELECT UPPER(SUBSTRING(username, 1, 1)) AS first_letter FROM clients WHERE id = ?', [loggedInClientId], (error, results) => {
        if (error) {
            console.error(error);
            return res.render('error', {
                message: 'Une erreur s\'est produite lors de la récupération du profil du client'
            });
        }

        if (results.length === 0) {
            return res.render('error', {
                message: 'Profil du client non trouvé'
            });
        }

        // Afficher le profil du client avec les URLs associées
        res.render('script', { client: results[0] });
    });

};

///////////////////////////////////////////////////////////////////////////////////////////////

exports.getDashboard = (req, res) => {
    if (!loggedInClientId) {
        return res.redirect('/connecter');
    }

    // Recherche du profil du client dans la base de données
    db.query('SELECT UPPER(SUBSTRING(username, 1, 1)) AS first_letter FROM clients WHERE id = ?', [loggedInClientId], (error, results) => {
        if (error) {
            console.error(error);
            return res.render('error', {
                message: 'Une erreur s\'est produite lors de la récupération du profil du client'
            });
        }

        if (results.length === 0) {
            return res.render('error', {
                message: 'Profil du client non trouvé'
            });
        }

        // Sélectionner les URL du client connecté à partir de la base de données
        db.query('SELECT * FROM urls WHERE client_id = ?', [loggedInClientId], (error, urlResults) => {
            if (error) {
                console.error(error);
                return res.status(500).render('error', {
                    message: 'Une erreur s\'est produite lors de la récupération des URLs du client.'
                });
            }

            // Afficher le profil du client avec les URLs associées
            res.render('dashboard', { client: results[0], urls: urlResults });
        });
    });
};
///////////////////////////////////////////////////////////////////////////////////////////////

exports.getLogout = (req, res) => {
    if (loggedInClientId) {
        // Si un client est connecté, déconnectez-le en réinitialisant l'ID du client connecté
        loggedInClientId = null;
    }
    // Rediriger vers la page d'accueil ou une autre page après la déconnexion
    res.redirect('/');
};
///////////////////////////////////////////////////////////////////////////////////////////////



module.exports = exports;