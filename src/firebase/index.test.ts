import debugFactory from 'debug';
import uuid from 'uuid';
import FirebaseStore from './index';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import FirebaseConfig from '../FirebaseConfig';
const debug = debugFactory('ywg:store:firebase');

describe('FirebaseStore User repository', () => {
  let container: StartedTestContainer;
  let config: FirebaseConfig;

  beforeEach(async () => {
    process.env.FIREBASE_MODE = 'EMULATOR';
    config = FirebaseConfig.of(process.env);
    container = await new GenericContainer('jeantil/firestore-emulator')
      .withExposedPorts(8080)
      .start();
    const emulatorPort = container.getMappedPort(8080);
    debug('container started');
    const emulatorHost = `localhost:${emulatorPort}`;
    process.env.FIRESTORE_EMULATOR_HOST = emulatorHost;
  });
  afterEach(async () => {
    //stop docker container
    debug('stopping container');
    container && container.stop();
    debug('container stopped');
  });
  it(`should store tokens `, async () => {
    debug('test starting');
    const store = new FirebaseStore(config);
    const token = {
      id: uuid.v4(),
      value: '000000',
      expires: 0
    };
    await store.tokens.save(token.id, token);
    const actual = await store.tokens.get(token.id);
    expect(actual).toEqual(token);
    debug('test completed');
  });
});
