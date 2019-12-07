import FirebaseConfig, { FirebaseMode } from './FirebaseConfig';

const DB_URL = 'db_url';
const PROJECT_ID = 'project_id';
const CLIENT_EMAIL = 'client_email';
const PRIVATE_KEY = 'private_key';
const APP_NAME = 'app_name';
const MODE = 'PROD';
const env: NodeJS.ProcessEnv = {
  FIREBASE_DB_URL: DB_URL,
  FIREBASE_PROJECT_ID: PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: PRIVATE_KEY,
  FIREBASE_APP_NAME: APP_NAME,
  FIREBASE_MODE: MODE
};
describe('FirebaseConfig', () => {
  it('should extract all config information from env', () => {
    const config = FirebaseConfig.of(env);
    expect(config.dbUrl).toBe(DB_URL);
    expect(config.projectId).toEqual(PROJECT_ID);
    expect(config.clientEmail).toEqual(CLIENT_EMAIL);
    expect(config.privateKey).toEqual(PRIVATE_KEY);
    expect(config.appName).toEqual(APP_NAME);
  });
  it('should build emulator config', () => {
    const config = FirebaseConfig.of({ FIREBASE_MODE: FirebaseMode.EMULATOR });
    expect(config.dbUrl).toBeDefined();
    expect(config.projectId).toBeDefined();
    expect(config.clientEmail).toBeDefined();
    expect(config.privateKey).toBeDefined();
    expect(config.appName).toBeDefined();
  });

  FirebaseConfig.KEYS.forEach(k => {
    it(`should fail on missing ${k}`, () => {
      const invalidEnv = { ...env };
      delete invalidEnv[k];
      expect(() =>
        FirebaseConfig.of(invalidEnv)
      ).toThrowErrorMatchingSnapshot();
    });
    it(`should fail on null ${k}`, () => {
      const invalidEnv = { ...env };
      invalidEnv[k] = null;
      expect(() =>
        FirebaseConfig.of(invalidEnv)
      ).toThrowErrorMatchingSnapshot();
    });
    it(`should fail on empty ${k}`, () => {
      const invalidEnv = { ...env };
      invalidEnv[k] = '';
      expect(() =>
        FirebaseConfig.of(invalidEnv)
      ).toThrowErrorMatchingSnapshot();
    });
  });
});

export { env };
