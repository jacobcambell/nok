require('dotenv').config();
import Express from 'express';
import * as firebaseAdmin from 'firebase-admin';
import mysql from 'mysql';
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
    }

    firebaseAdmin
        .auth()
        .verifyIdToken(req.body.idToken)
        .then((decodedToken) => {
            const uid = decodedToken.uid;
            console.log(decodedToken)
            res.sendStatus(200);
        })
        .catch((error) => {
            console.log(error)
            res.sendStatus(200);
        });
})
app.listen(PORT, () => {
    console.log('Listening on ' + PORT)
})