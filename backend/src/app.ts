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
                    console.log('This person already exists')
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

app.listen(PORT, () => {
    console.log('Listening on ' + PORT)
})