import uuid from 'uuid';

process.env.STORE_BACKEND = 'MEMORY';
process.env.FIREBASE_SECURE = 'false';
process.env.FIREBASE_APP_NAME = uuid.v4();
process.env.FIREBASE_PROJECT_ID = uuid.v4();
process.env.FIREBASE_DB_URL = process.env.FIREBASE_APP_NAME;
process.env.FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_APP_NAME;
process.env.FIREBASE_PRIVATE_KEY = process.env.FIREBASE_APP_NAME;
process.env.PASSPORT_SECRET = 'secret';

jest.setTimeout(60000);
