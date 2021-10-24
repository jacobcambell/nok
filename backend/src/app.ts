require('dotenv').config();
import axios from 'axios';
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
    database: process.env.MYSQL_DATABASE,
    charset: 'utf8mb4'
});
con.connect();

// Socket.IO
import { Server } from "socket.io";
const io = new Server({});

io.on("connection", (socket) => {
    socket.on('ping', async (data) => {
        const check = [
            data.idToken,
            // data.expoPushToken - optional
        ];

        if (check.includes(undefined) || check.includes(null)) {
            return;
        }

        let uid: string = '';

        try {
            await firebaseAdmin.auth().verifyIdToken(data.idToken).then(decodedToken => { uid = decodedToken.uid })
        }
        catch (e) {
            return;
        }

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

                // If they sent a expoPushToken, we want to assign it to them so they can receive push notifications
                // Notice that we will update this value with anything the user sends, so if they log in with a new device it will get
                // updated to send notifications to their most recent device
                if (typeof data.expoPushToken !== 'undefined') {
                    con.query('UPDATE users SET expoPushToken=? WHERE firebase_uid=?', [data.expoPushToken, uid], (err, results) => {
                        if (err) throw err;
                    })
                }
            }
        });

        // Subscribe this socket to a room named after their firebase uid
        socket.join(uid);
    })

    socket.on('get-my-username', async (data) => {
        const check = [
            data.idToken
        ];

        if (check.includes(undefined) || check.includes(null)) {
            return;
        }

        let uid: string = '';

        try {
            await firebaseAdmin.auth().verifyIdToken(data.idToken).then(decodedToken => { uid = decodedToken.uid })
        }
        catch (e) {
            return;
        }

        // Get this user's username based on their firebase uid
        con.query('SELECT users.username FROM users WHERE users.firebase_uid=?', [uid], (err, results) => {
            if (err) throw err;

            if (results.length === 0) {
                // User doesn't have a username for some reason?
                return;
            }
            socket.emit('return-username', {
                username: results[0].username
            })
        });
    })

    socket.on('add-contact', async (data) => {
        const check = [
            data.idToken,
            data.username
        ];

        if (check.includes(undefined) || check.includes(null)) {
            return;
        }

        let uid: string = '';

        try {
            await firebaseAdmin.auth().verifyIdToken(data.idToken).then(decodedToken => { uid = decodedToken.uid })
        }
        catch (e) {
            return;
        }

        // Get this user's id from their firebase_uid
        con.query(`SELECT users.id FROM users WHERE users.firebase_uid=?`, [uid], (err, results) => {
            if (err) throw err;

            if (results.length === 0) {
                // No user id found for this firebase_uid for some reason
                return;
            }

            const user_id = results[0].id;

            // Get the contact (person they are adding)'s user id
            con.query('SELECT users.id FROM users WHERE users.username=?', [data.username], (err, results) => {
                if (err) throw err;

                if (results.length === 0) {
                    // No user exists with the username the client sent
                    socket.emit('add-contact-error', { message: 'No user exists with that username' })
                    return;
                }

                const contact_id = results[0].id;

                // User should not be able to add themselves
                if (user_id === contact_id) {
                    socket.emit('add-contact-error', { message: 'You cannot add yourself as a contact!' })
                    return;
                }

                // Check if user already has a contact with this person's id
                con.query('SELECT COUNT(*) AS c FROM contacts WHERE contacts.owner_id=? AND contacts.contact_id=?', [user_id, contact_id], (err, results) => {
                    if (err) throw err;

                    if (results[0].c > 0) {
                        // User is already contacts with the requested user
                        socket.emit('add-contact-error', { message: 'You are already contacts with ' + data.username })
                        return;
                    }

                    // Not contacts yet. Add this user as owner, and the requested user as contact
                    con.query('INSERT INTO contacts (owner_id, contact_id, is_pending) VALUES (?, ?, 1)', [user_id, contact_id], (err, results) => {
                        if (err) throw err;

                        socket.emit('add-contact-success')
                        return;
                    });
                })
            });
        });
    })

    socket.on('disconnect', () => {
        // TODO - unsubscribe users from rooms on disconnect
    })

    socket.on('get-message-threads', async (data) => {
        const check = [
            data.idToken
        ];

        if (check.includes(undefined) || check.includes(null)) {
            return;
        }

        let uid: string = '';

        try {
            await firebaseAdmin.auth().verifyIdToken(data.idToken).then(decodedToken => { uid = decodedToken.uid })
        }
        catch (e) {
            return;
        }

        // Get this user's id from their firebase uid
        con.query('SELECT users.id FROM users WHERE users.firebase_uid=?', [uid], (err, results) => {
            if (err) throw err;

            if (results.length === 0) {
                // For some reason there is no user id matching that firebase uid
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
                    socket.emit('return-message-threads', message_threads)
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
                            socket.emit('return-message-threads', message_threads)
                        }
                    });
                }
            });
        })
    })

    socket.on('send-message', async (data) => {
        const check = [
            data.idToken,
            data.thread_id,
            data.message
        ];

        if (check.includes(undefined) || check.includes(null)) {
            return;
        }

        // Message length
        if (typeof data.message !== 'string' || data.message.length <= 0 || data.message.length >= 999) {
            return;
        }

        let uid: string = '';

        try {
            await firebaseAdmin.auth().verifyIdToken(data.idToken).then(decodedToken => { uid = decodedToken.uid })
        }
        catch (e) {
            return;
        }

        // Get this user's id, username from their firebase uid
        con.query('SELECT users.id, users.username FROM users WHERE users.firebase_uid=?', [uid], (err, results) => {
            if (err) throw err;

            if (results.length === 0) {
                // For some reason there is no user id matching that firebase uid
                return;
            }

            const user_id = results[0].id;
            const users_username = results[0].username;

            // Check if this user is a member of the requested thread
            con.query(`SELECT
                                COUNT(*) as C from
                                message_threads
                                WHERE
                                (message_threads.user1=? OR message_threads.user2=?) AND
                                message_threads.id=?
                                `, [user_id, user_id, data.thread_id], (err, results) => {
                if (err) throw err;

                if (results[0].c === 0) {
                    // User does not belong to the requested thread
                    return;
                }

                // User belongs to requested thread, add message
                con.query(`INSERT INTO messages (thread_id, from_user, send_time, message) VALUES (?, ?, NOW(), ?)`, [data.thread_id, user_id, data.message], (err, results) => {
                    if (err) throw err;

                    // Update read status for other user
                    con.query('UPDATE message_thread_readstatus SET is_read=0 WHERE thread_id=? AND user_id!=?', [data.thread_id, user_id], (err, results) => {
                        if (err) throw err;

                        socket.emit('send-message-success')

                        // Broadcast message to recipient
                        // Get the recipient's firebase uid
                        con.query(`SELECT
                                    users.firebase_uid
                                    FROM users, message_threads
                                    WHERE (message_threads.user1=users.id OR message_threads.user2=users.id) AND
                                    users.id!=? AND
                                    message_threads.id=?
                                    `, [user_id, data.thread_id], (err, results) => {
                            if (err) throw err;

                            // Send both events to the user's room
                            socket.to(results[0].firebase_uid).emit('client-new-message-threads')
                            socket.to(results[0].firebase_uid).emit('client-new-message')
                        })
                    });

                    // We want to grab the expoPushToken for the recipient (if there is one), and send them a push notification
                    con.query(`SELECT
                                users.expoPushToken
                                FROM users, message_threads
                                WHERE
                                (users.id=message_threads.user1 OR users.id=message_threads.user2) AND
                                message_threads.id=? AND
                                users.id!=?
                    `, [data.thread_id, user_id], (err, results) => {
                        if (err) throw err;

                        // If null, it means the recipient user does not have a expoPushToken and we will just ignore sending a notification
                        if (results[0].expoPushToken !== null) {
                            const message = {
                                to: results[0].expoPushToken,
                                sound: 'default',
                                title: users_username,
                                body: data.message,
                                // data: { someData: 'goes here' },
                            };

                            axios.post('https://exp.host/--/api/v2/push/send', message).catch(e => { })
                        }
                    })
                });
            })
        })
    })

    socket.on('get-conversation-messages', async (data) => {
        const check = [
            data.idToken,
            data.thread_id
        ];

        if (check.includes(undefined) || check.includes(null)) {
            return;
        }

        let uid: string = '';

        try {
            await firebaseAdmin.auth().verifyIdToken(data.idToken).then(decodedToken => { uid = decodedToken.uid })
        }
        catch (e) {
            return;
        }

        // Get this user's id from their firebase uid
        con.query('SELECT users.id FROM users WHERE users.firebase_uid=?', [uid], (err, results) => {
            if (err) throw err;

            if (results.length === 0) {
                // For some reason there is no user id matching that firebase uid
                return;
            }

            const user_id = results[0].id;

            // Load messages from the requested thread id, IF the user is in it. Returns empty if they do not belong to the requested thread id
            con.query(`SELECT
                                messages.id AS message_id,
                                messages.message,
                                TIMESTAMPDIFF(MINUTE, messages.send_time, NOW()) as message_age,
                                users.username
                                FROM messages, message_threads, users
                                WHERE
                                (message_threads.user1=? OR message_threads.user2=?) AND
                                message_threads.id=messages.thread_id AND
                                message_threads.id=? AND
                                users.id=messages.from_user
                                ORDER BY messages.send_time ASC
                    `, [user_id, user_id, data.thread_id], (err, results) => {
                if (err) throw err;

                interface Message {
                    message_id: number;
                    from: string;
                    message: string;
                    message_age: string;
                }

                let messages: Message[] = [];

                for (let i = 0; i < results.length; i++) {
                    messages.push({ message_id: results[i].message_id, from: results[i].username, message: results[i].message, message_age: results[i].message_age });
                }

                // Update the read status for this user/thread combo
                con.query('UPDATE message_thread_readstatus SET is_read=1 WHERE user_id=? AND thread_id=?', [user_id, data.thread_id], (err, results) => {
                    if (err) throw err;
                })

                socket.emit('return-conversation-messages', messages)
            })
        });
    })

    socket.on('get-contacts', async (data) => {
        const check = [
            data.idToken
        ];

        if (check.includes(undefined) || check.includes(null)) {
            return;
        }

        let uid: string = '';

        try {
            await firebaseAdmin.auth().verifyIdToken(data.idToken).then(decodedToken => { uid = decodedToken.uid })
        }
        catch (e) {
            return;
        }

        // Get this user's id from their firebase uid
        con.query('SELECT users.id FROM users WHERE users.firebase_uid=?', [uid], (err, results) => {
            if (err) throw err;

            if (results.length === 0) {
                // For some reason there is no user id matching that firebase uid
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

                        socket.emit('return-contacts', response)
                    });
                });
            });
        });
    })
});

io.listen(6000);

app.post('/process-contact', async (req: Express.Request, res: Express.Response) => {
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

    let uid: string = '';

    try {
        await firebaseAdmin.auth().verifyIdToken(req.body.idToken).then(decodedToken => { uid = decodedToken.uid })
    }
    catch (e) {
        res.sendStatus(400);
        return;
    }

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

app.post('/change-username', async (req: Express.Request, res: Express.Response) => {
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

    let uid: string = '';

    try {
        await firebaseAdmin.auth().verifyIdToken(req.body.idToken).then(decodedToken => { uid = decodedToken.uid })
    }
    catch (e) {
        res.sendStatus(400);
        return;
    }

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

app.listen(PORT, () => {
    console.log('Listening on ' + PORT)
})