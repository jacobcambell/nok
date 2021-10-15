require('dotenv').config();
import e from 'express';
import Express from 'express';
import * as firebaseAdmin from 'firebase-admin';
import mysql from 'mysql';
import { generateName } from './generateName';
const app = Express();
const PORT = process.env.PORT || 4000;
app.use(Express.json())

// Firebase Initialization
const serviceAccount = require('../credentials/serviceAccountKey.json');
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount)
});

// MySQL Initialization
const con = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});
con.connect();

app.post('/ping', (req: Express.Request, res: Express.Response) => {
    // User will send their firebase idToken every time they render the Main component
    const check = [
        req.body.idToken
    ];

    if (check.includes(undefined)) {
        res.sendStatus(400);
        return;
    }

    firebaseAdmin
        .auth()
        .verifyIdToken(req.body.idToken)
        .then((decodedToken) => {
            const uid = decodedToken.uid;

            // Valid Firebase user. Next we want to check if this uid exists in the users table
            con.query('SELECT COUNT(*) AS c FROM users WHERE users.firebase_uid=?', [uid], (err, results) => {
                if (err) throw err;

                if (results[0].c === 0) {
                    // UID is not in our users table. Let's add them to it
                    let newUsername = generateName();
                    con.query('INSERT INTO users (firebase_uid, username) VALUES (?, ?)', [uid, newUsername], (err, results) => {
                        if (err) throw err;
                    });
                }
                else {
                    // This uid already exists in our users table
                }

                res.sendStatus(200);
            });
        })
        .catch((error) => {
            res.sendStatus(400);
        });
})

app.post('/get-my-username', (req: Express.Request, res: Express.Response) => {
    const check = [
        req.body.idToken
    ];

    if (check.includes(undefined)) {
        res.sendStatus(400);
        return;
    }

    firebaseAdmin
        .auth()
        .verifyIdToken(req.body.idToken)
        .then((decodedToken) => {
            const uid = decodedToken.uid;

            // Get this user's username based on their firebase uid
            con.query('SELECT users.username FROM users WHERE users.firebase_uid=?', [uid], (err, results) => {
                if (err) throw err;

                if (results.length === 0) {
                    // User doesn't have a username for some reason?
                    res.sendStatus(400);
                    return;
                }

                res.json({ error: false, username: results[0].username })
                return;
            });
        })
        .catch((error) => {
            res.sendStatus(400);
        })
})

app.post('/add-contact', (req: Express.Request, res: Express.Response) => {
    const check = [
        req.body.idToken,
        req.body.username
    ];

    if (check.includes(undefined)) {
        res.sendStatus(400);
        return;
    }

    firebaseAdmin
        .auth()
        .verifyIdToken(req.body.idToken)
        .then((decodedToken) => {
            const uid = decodedToken.uid;

            // Get this user's id from their firebase_uid
            con.query(`SELECT users.id FROM users WHERE users.firebase_uid=?`, [uid], (err, results) => {
                if (err) throw err;

                if (results.length === 0) {
                    // No user id found for this firebase_uid for some reason
                    res.sendStatus(400);
                    return;
                }

                const user_id = results[0].id;

                // Get the contact (person they are adding)'s user id
                con.query('SELECT users.id FROM users WHERE users.username=?', [req.body.username], (err, results) => {
                    if (err) throw err;

                    if (results.length === 0) {
                        // No user exists with the username the client sent
                        res.json({ error: true, message: 'No user with that username found' });
                        return;
                    }

                    const contact_id = results[0].id;

                    // User should not be able to add themselves
                    if (user_id === contact_id) {
                        res.json({ error: true, message: 'You cannot add yourself. Nice try' })
                        return;
                    }

                    // Check if user already has a contact with this person's id
                    con.query('SELECT COUNT(*) AS c FROM contacts WHERE contacts.owner_id=? AND contacts.contact_id=?', [user_id, contact_id], (err, results) => {
                        if (err) throw err;

                        if (results[0].c > 0) {
                            // User is already contacts with the requested user
                            res.json({ error: true, message: 'You are already contacts with ' + req.body.username + '!' });
                            return;
                        }

                        // Not contacts yet. Add this user as owner, and the requested user as contact
                        con.query('INSERT INTO contacts (owner_id, contact_id, is_pending) VALUES (?, ?, 1)', [user_id, contact_id], (err, results) => {
                            if (err) throw err;

                            res.json({ error: false, message: 'Added ' + req.body.username + ' to your contacts' });
                            return;
                        });
                    })
                });
            });
        })
        .catch((error) => {
            res.sendStatus(400);
        })
})

app.post('/get-contacts', (req: Express.Request, res: Express.Response) => {
    const check = [
        req.body.idToken
    ];

    if (check.includes(undefined)) {
        res.sendStatus(400);
        return;
    }

    firebaseAdmin
        .auth()
        .verifyIdToken(req.body.idToken)
        .then((decodedToken) => {
            const uid = decodedToken.uid;

            // Get this user's id from their firebase uid
            con.query('SELECT users.id FROM users WHERE users.firebase_uid=?', [uid], (err, results) => {
                if (err) throw err;

                if (results.length === 0) {
                    // For some reason there is no user id matching that firebase uid
                    res.sendStatus(400);
                    return;
                }

                const user_id = results[0].id;

                interface Contact {
                    id: number;
                    username: string;
                }

                let active_contacts: Contact[] = [];
                let outgoing_contacts: Contact[] = [];
                let incoming_contacts: Contact[] = [];

                // Get all non-pending contacts for this user
                con.query(`SELECT
                            users.id,
                            users.username
                            FROM users, contacts
                            WHERE
                            (contacts.owner_id=? OR contacts.contact_id=?) AND
                            contacts.is_pending=0 AND
                            (contacts.contact_id=users.id OR contacts.owner_id=users.id) AND
                            users.id!=?
                `, [user_id, user_id, user_id], (err, results) => {
                    if (err) throw err;

                    for (let i = 0; i < results.length; i++) {
                        active_contacts.push({ id: results[i].id, username: results[i].username });
                    }

                    // Get all outgoing, pending contact requests
                    con.query(`SELECT
                                users.id,
                                users.username
                                FROM users, contacts
                                WHERE
                                contacts.owner_id=? AND
                                contacts.is_pending=1 AND
                                contacts.contact_id=users.id`, [user_id], (err, results) => {
                        if (err) throw err;

                        for (let i = 0; i < results.length; i++) {
                            outgoing_contacts.push({ id: results[i].id, username: results[i].username });
                        }

                        // Get all incoming, pending contact requests
                        con.query(`SELECT
                                    users.id,
                                    users.username
                                    FROM users, contacts
                                    WHERE
                                    contacts.contact_id=? AND
                                    contacts.is_pending=1 AND
                                    contacts.owner_id=users.id`, [user_id], (err, results) => {
                            if (err) throw err;

                            for (let i = 0; i < results.length; i++) {
                                incoming_contacts.push({ id: results[i].id, username: results[i].username });
                            }

                            // Build and send response to client
                            let response = {
                                active_contacts,
                                outgoing_contacts,
                                incoming_contacts
                            }

                            res.json(response);
                        });
                    });
                });
            });
        })
        .catch((error) => {
            res.sendStatus(400);
        })
})

app.post('/process-contact', (req: Express.Request, res: Express.Response) => {
    // Params:
    // contact_id: number - the contact the user wants to process
    // command: string = accept, deny, or cancel depending on what the user wants to do

    const check = [
        req.body.contact_id,
        req.body.command,
        req.body.idToken
    ];

    if (check.includes(undefined)) {
        res.sendStatus(400);
        return;
    }

    // Check valid command
    if (req.body.command !== 'accept' && req.body.command !== 'deny' && req.body.command !== 'cancel') {
        res.sendStatus(400);
        return;
    }

    firebaseAdmin
        .auth()
        .verifyIdToken(req.body.idToken)
        .then((decodedToken) => {
            const uid = decodedToken.uid;

            // Get this user's id from their firebase uid
            con.query('SELECT users.id FROM users WHERE users.firebase_uid=?', [uid], (err, results) => {
                if (err) throw err;

                if (results.length === 0) {
                    // For some reason there is no user id matching that firebase uid
                    res.sendStatus(400);
                    return;
                }

                const user_id = results[0].id;

                switch (req.body.command) {
                    case 'accept':
                        acceptContact(req.body.contact_id, user_id);
                        break;
                    case 'deny':
                        denyContact(req.body.contact_id, user_id);
                        break;
                    case 'cancel':
                        cancelContact(req.body.contact_id, user_id);
                        break;
                    default:
                        res.sendStatus(400);
                        break;
                }

                res.sendStatus(200);
                return;
            })
        })
        .catch((error) => {
            res.sendStatus(400);
        })

    const acceptContact = (contact_id: number, user_id: number) => {
        con.query('UPDATE contacts SET is_pending=0 WHERE contact_id=? AND owner_id=? AND is_pending=1', [user_id, contact_id], (err, results) => {
            if (err) throw err;

            // Create a message thread for these two users
            con.query('INSERT INTO message_threads (user1, user2) VALUES (?, ?)', [contact_id, user_id], (err, results) => {
                if (err) throw err;
            });
        });
    }

    const denyContact = (contact_id: number, user_id: number) => {
        con.query('DELETE FROM contacts WHERE contact_id=? AND owner_id=? AND is_pending=1', [user_id, contact_id], (err, results) => {
            if (err) throw err;
        });
    }

    const cancelContact = (contact_id: number, user_id: number) => {
        con.query('DELETE FROM contacts WHERE contact_id=? AND owner_id=? AND is_pending=1', [contact_id, user_id], (err, results) => {
            if (err) throw err;
        });
    }
})

app.post('/get-message-threads', (req: Express.Request, res: Express.Response) => {
    const check = [
        req.body.idToken
    ];

    if (check.includes(undefined)) {
        res.sendStatus(400);
        return;
    }

    firebaseAdmin
        .auth()
        .verifyIdToken(req.body.idToken)
        .then((decodedToken) => {
            const uid = decodedToken.uid;

            // Get this user's id from their firebase uid
            con.query('SELECT users.id FROM users WHERE users.firebase_uid=?', [uid], (err, results) => {
                if (err) throw err;

                if (results.length === 0) {
                    // For some reason there is no user id matching that firebase uid
                    res.sendStatus(400);
                    return;
                }

                const user_id = results[0].id;

                // Load all the message threads this user is a member of
                con.query(`SELECT
                            message_threads.id,
                            users.username
                            FROM
                            message_threads, users
                            WHERE
                            (message_threads.user1 = ? OR message_threads.user2 = ?) AND
                            (message_threads.user1 = users.id OR message_threads.user2 = users.id) AND
                            users.id!=?
                `, [user_id, user_id, user_id], (err, results) => {
                    if (err) throw err;

                    interface MessageThread {
                        id: number;
                        username: string;
                    }

                    let message_threads: MessageThread[] = [];

                    for (let i = 0; i < results.length; i++) {
                        message_threads.push({ id: results[i].id, username: results[i].username });
                    }

                    res.json(message_threads)
                });
            })
        });

})

app.listen(PORT, () => {
    console.log('Listening on ' + PORT)
})