# Nok

### API Setup

First, install all the required dependencies:

`npm install`

Next, create a `.env` file. There are a couple environment variables that must be set:

```
MYSQL_HOST=
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_DATABASE=
```

Then, you will need to upload your Firebase service account key (.json file). This file can be created in your Firebase project's settings.

This key should be placed in `/credentials/serviceAccountKey.json`


An example of the key:
```
{
  "type": "service_account",
  "project_id": "",
  "private_key_id": "",
  "private_key": "",
  "client_id": "",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": ""
}
```

More information about the Firebase Admin SDK: [Read more](https://firebase.google.com/docs/admin/setup)

The MySQL database structure can be found in `/nok.sql`

The application is built with TypeScript, you can compile it with the command `npm run tsc`