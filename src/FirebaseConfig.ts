import { enforceMandatory } from './helpers';
import uuid = require('uuid');
export enum FirebaseMode {
  MEMORY = 'MEMORY',
  EMULATOR = 'EMULATOR',
  PROD = 'PROD'
}
class FirebaseConfig {
  static of(env: NodeJS.ProcessEnv): FirebaseConfig {
    enforceMandatory('Firebase', env, [this.FIREBASE_MODE]);
    const mode = env[this.FIREBASE_MODE];
    switch (mode) {
      case FirebaseMode.PROD:
        enforceMandatory('Firebase', env, this.KEYS);
        return new FirebaseConfig(
          mode,
          env[this.FIREBASE_DB_URL],
          env[this.FIREBASE_PROJECT_ID],
          env[this.FIREBASE_CLIENT_EMAIL],
          env[this.FIREBASE_PRIVATE_KEY],
          env[this.FIREBASE_APP_NAME]
        );
      case FirebaseMode.EMULATOR: {
        const name = uuid.v4();
        const project = uuid.v4();

        return new FirebaseConfig(mode, name, project, name, name, name);
      }
      case FirebaseMode.MEMORY: {
        return new FirebaseConfig(mode, null, null, null, null, null);
      }
    }
  }

  static FIREBASE_MODE = 'FIREBASE_MODE';
  static FIREBASE_DB_URL = 'FIREBASE_DB_URL';
  static FIREBASE_PROJECT_ID = 'FIREBASE_PROJECT_ID';
  static FIREBASE_CLIENT_EMAIL = 'FIREBASE_CLIENT_EMAIL';
  static FIREBASE_PRIVATE_KEY = 'FIREBASE_PRIVATE_KEY';
  static FIREBASE_APP_NAME = 'FIREBASE_APP_NAME';

  static KEYS = [
    FirebaseConfig.FIREBASE_DB_URL,
    FirebaseConfig.FIREBASE_PROJECT_ID,
    FirebaseConfig.FIREBASE_CLIENT_EMAIL,
    FirebaseConfig.FIREBASE_PRIVATE_KEY
  ];
  constructor(
    readonly mode: string,
    readonly dbUrl: string,
    readonly projectId: string,
    readonly clientEmail: string,
    readonly privateKey: string,
    readonly appName: string
  ) {}
}

export default FirebaseConfig;
