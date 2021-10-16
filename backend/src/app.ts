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

    if (check.includes(undefined) || check.includes(null)) {
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

                    con.query('SELECT COUNT(*) AS c FROM users WHERE users.username=?', [newUsername], (err, results) => {
                        if (err) throw err;

                        if (results[0].c === 1) {
                            // User with that username already exists, so we'll add some numbers to the end (100 through 999)
                            newUsername += (Math.random() * (999 - 100) + 100).toString();
                        }

                        con.query('INSERT INTO users (firebase_uid, username) VALUES (?, ?)', [uid, newUsername], (err, results) => {
                            if (err) throw err;
                        });
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

    if (check.includes(undefined) || check.includes(null)) {
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

    if (check.includes(undefined) || check.includes(null)) {
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

    if (check.includes(undefined) || check.includes(null)) {
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

    if (check.includes(undefined) || check.includes(null)) {
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

                // This is the id of the message thread we just created
                let thread_id = results.insertId;

                // Now we want to insert read status rows for each user in this thread
                con.query('INSERT INTO message_thread_readstatus (thread_id, user_id, is_read) VALUES (?, ?, 1)', [thread_id, user_id], (err, results) => {
                    if (err) throw err;
                });
                con.query('INSERT INTO message_thread_readstatus (thread_id, user_id, is_read) VALUES (?, ?, 1)', [thread_id, contact_id], (err, results) => {
                    if (err) throw err;
                });
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

    if (check.includes(undefined) || check.includes(null)) {
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
                        msg_preview: string;
                        is_read: boolean;
                    }

                    let message_threads: MessageThread[] = [];

                    // Loop through all the message threads we got from the database and add them to the array along with the msg_preview
                    let i = 0;
                    let size = results.length;

                    // Check if user has no message threads
                    if (size === 0) {
                        res.json(message_threads);
                        return;
                    }

                    messageLoop();
                    function messageLoop() {
                        let thread_id = results[i].id;
                        let username = results[i].username;

                        // For each message thread, we want to load the last message from that thread
                        con.query(`SELECT
                                    messages.message,
                                    message_thread_readstatus.is_read
                                    FROM messages, message_threads, message_thread_readstatus
                                    WHERE messages.thread_id=message_threads.id AND
                                    message_threads.id=? AND
                                    message_threads.id=message_thread_readstatus.thread_id AND
                                    message_thread_readstatus.user_id=?
                                    ORDER BY messages.send_time DESC LIMIT 1
                                    `, [thread_id, user_id], (err, results) => {
                            if (err) throw err;

                            let last_message = '(No messages)';
                            let is_read = true;

                            if (results.length !== 0) {
                                if (results[0].message.length > 40) {
                                    last_message = results[0].message.substring(0, 40) + '...';
                                }
                                else {
                                    last_message = results[0].message;
                                }

                                is_read = results[0].is_read;
                            }

                            message_threads.push({ id: thread_id, username: username, msg_preview: last_message, is_read: is_read });

                            i++;
                            if (i < size) {
                                messageLoop();
                            } else {
                                res.json(message_threads);
                            }
                        });
                    }
                });
            })
        });
})

app.post('/get-conversation-messages', (req: Express.Request, res: Express.Response) => {
    const check = [
        req.body.idToken,
        req.body.thread_id
    ];

    if (check.includes(undefined) || check.includes(null)) {
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

                // Load messages from the requested thread id, IF the user is in it. Returns empty if they do not belong to the requested thread id
                con.query(`SELECT
                            messages.id AS message_id,
                            messages.message,
                            users.username
                            FROM messages, message_threads, users
                            WHERE
                            (message_threads.user1=? OR message_threads.user2=?) AND
                            message_threads.id=messages.thread_id AND
                            message_threads.id=? AND
                            users.id=messages.from_user
                            ORDER BY messages.send_time ASC
                `, [user_id, user_id, req.body.thread_id], (err, results) => {
                    if (err) throw err;

                    interface Message {
                        message_id: number;
                        from: string;
                        message: string;
                    }

                    let messages: Message[] = [];

                    for (let i = 0; i < results.length; i++) {
                        messages.push({ message_id: results[i].message_id, from: results[i].username, message: results[i].message });
                    }

                    // Update the read status for this user/thread combo
                    con.query('UPDATE message_thread_readstatus SET is_read=1 WHERE user_id=? AND thread_id=?', [user_id, req.body.thread_id], (err, results) => {
                        if (err) throw err;
                    })

                    res.json(messages);
                    return;
                })
            });
        })
})

app.post('/send-message', (req: Express.Request, res: Express.Response) => {
    const check = [
        req.body.idToken,
        req.body.thread_id,
        req.body.message
    ];

    if (check.includes(undefined) || check.includes(null)) {
        res.sendStatus(400)
        return;
    }

    // Message length
    if (typeof req.body.message !== 'string' || req.body.message.length <= 0 || req.body.message.length >= 999) {
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

                // Check if this user is a member of the requested thread
                con.query(`SELECT
                            COUNT(*) as C from
                            message_threads
                            WHERE
                            (message_threads.user1=? OR message_threads.user2=?) AND
                            message_threads.id=?
                            `, [user_id, user_id, req.body.thread_id], (err, results) => {
                    if (err) throw err;

                    if (results[0].c === 0) {
                        // User does not belong to the requested thread
                        res.sendStatus(400);
                        return;
                    }

                    // User belongs to requested thread, add message
                    con.query(`INSERT INTO messages (thread_id, from_user, send_time, message) VALUES (?, ?, NOW(), ?)`, [req.body.thread_id, user_id, req.body.message], (err, results) => {
                        if (err) throw err;

                        res.sendStatus(200);
                        return;
                    });
                })
            })
        })
})

app.post('/change-username', (req: Express.Request, res: Express.Response) => {
    const check = [
        req.body.idToken,
        req.body.username
    ];

    if (check.includes(undefined) || check.includes(null)) {
        res.sendStatus(400);
        return;
    }

    // Check username length
    if (typeof req.body.username !== 'string' || req.body.username.length <= 0 || req.body.username.length > 15) {
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

                // Check if the requested username already exists
                con.query('SELECT COUNT(*) as c FROM users WHERE users.username=?', [req.body.username], (err, results) => {
                    if (err) throw err;

                    if (results[0].c > 0) {
                        // Someone with the requested username already exists
                        res.json({ error: true, message: 'Username taken' });
                        return;
                    }

                    // No users with this username, update this user
                    con.query('UPDATE users SET users.username=? WHERE users.id=?', [req.body.username, user_id], (err, results) => {
                        if (err) throw err;

                        res.json({ error: false, message: 'Updated username successfully' })
                        return;
                    });
                })
            })
        })
})

app.listen(PORT, () => {
    console.log('Listening on ' + PORT)
})