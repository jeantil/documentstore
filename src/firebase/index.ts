import * as firebase from 'firebase-admin';
import admin = require('firebase-admin');
import {
  CollectionReference,
  FieldPath,
  DocumentSnapshot
} from '@google-cloud/firestore';
import {
  EventSourcedStore,
  FirestoreEvent,
  FirestoreDocument,
  SingleWriteResult,
  EventStore,
  DocumentStore
} from '..';
import { Maybe, Some, None } from 'monet';
import { Store } from '..';
import FirebaseConfig, { FirebaseMode } from '../FirebaseConfig';

const _getDoc = (
  collection: CollectionReference,
  id: string
): Promise<DocumentSnapshot> => {
  if (!id) {
    console.error(`Empty id requested from ${collection.path}`);
  }
  return collection
    .doc(id)
    .get()
    .catch(err => {
      console.error(`failed to get ${collection.path}/${id}`);
      throw err;
    });
};

const get = <T>(
  collection: CollectionReference
): ((id: string) => Promise<T>) => {
  const get = async (id: string): Promise<T & FirestoreDocument> => {
    const doc = await _getDoc(collection, id);
    if (doc.exists) {
      return { ...doc.data(), id } as T & FirestoreDocument;
    } else {
      throw new Error(`No entity with id ${id} found in ${collection.path}`);
    }
  };
  return get;
};

const getOpt = <T>(
  collection: CollectionReference
): ((id: string) => Promise<Maybe<T>>) => {
  const getOpt = async (id: string): Promise<Maybe<T>> => {
    const doc = await _getDoc(collection, id);
    if (doc && doc.exists) {
      return Some({ ...doc.data(), id } as T & FirestoreDocument);
    } else {
      return None();
    }
  };
  return getOpt;
};

const save = <T>(
  collection: CollectionReference
): ((id: string, data: T) => Promise<SingleWriteResult>) => {
  const save = async (id: string, data: T): Promise<SingleWriteResult> => {
    const result = await collection
      .doc(id)
      .set(data)
      .catch(err => {
        console.error(`failed to save ${collection.path}/${id},`, err);
        throw err;
      });
    return { id: id, result: result.writeTime.toDate() };
  };
  return save;
};

const merge = <T>(
  collection: CollectionReference
): ((
  id: string,
  data: T,
  mergeFields?: (string | FieldPath)[]
) => Promise<SingleWriteResult>) => {
  const merge = async (
    id: string,
    data: T,
    mergeFields?: (string | FieldPath)[]
  ): Promise<SingleWriteResult> => {
    const options = { merge: true, mergeFields: mergeFields };
    const result = await collection
      .doc(id)
      .set(data, options)
      .catch(err => {
        console.error(`failed to merge ${collection.path}/${id}`);
        throw err;
      });
    return { id: id, result: result.writeTime.toDate() };
  };
  return merge;
};

const del = (
  collection: CollectionReference
): ((id: string) => Promise<SingleWriteResult>) => {
  const del = async (id: string): Promise<SingleWriteResult> => {
    const result = await collection
      .doc(id)
      .delete()
      .catch(err => {
        console.error(`failed to delete ${collection.path}/${id}`);
        throw err;
      });
    return { id: id, result: result.writeTime.toDate() };
  };
  return del;
};

const setAll = <T extends FirestoreDocument>(
  collection: CollectionReference
): ((documents: T[]) => Promise<SingleWriteResult[]>) => {
  const setAll = async (documents: T[]): Promise<SingleWriteResult[]> => {
    const eventIds = await documents.reduce(async (accP, doc) => {
      const acc = await accP;
      const result = await collection.doc((doc as T).id).set(doc);
      return [...acc, { id: (doc as T).id, result: result.writeTime }];
    }, Promise.resolve([]));
    return eventIds;
  };
  return setAll;
};

const getAll = <T>(
  collection: CollectionReference
): (() => Promise<Array<T & FirestoreDocument>>) => {
  const getAll = async (
    orderBy?: string
  ): Promise<Array<T & FirestoreDocument>> => {
    const querySnapshot = orderBy
      ? await collection.orderBy(orderBy).get()
      : await collection.get();
    const docs = querySnapshot.docs.map(ref => {
      const data = ref.data() as object;
      return { ...data, id: ref.id } as T & FirestoreDocument;
    });
    return docs;
  };
  return getAll;
};
const getAllEvents = <T extends FirestoreEvent>(
  collection: CollectionReference
): (() => Promise<Array<T>>) => {
  const getAll = async (): Promise<Array<T>> => {
    const querySnapshot = await collection
      .orderBy('timestamp')
      .orderBy('id')
      .get();
    const docs = querySnapshot.docs.map(ref => {
      const data = ref.data() as object;
      return { ...data, id: ref.id } as T;
    });
    return docs;
  };
  return getAll;
};
class FirebaseDocumentStore<T extends FirestoreDocument> {
  readonly name: string;
  constructor(
    readonly collection: CollectionReference,
    readonly db: FirebaseFirestore.Firestore
  ) {
    this.name = collection.path;
  }
  get = get<T>(this.collection);
  getOpt = getOpt<T>(this.collection);
  save = save<T>(this.collection);
  merge = merge<T>(this.collection);
  delete = del(this.collection);
  getAll = getAll<T>(this.collection);
}
class FirebaseEventStore<T extends FirestoreEvent>
  extends FirebaseDocumentStore<T>
  implements EventStore<T> {
  getAll = getAllEvents<T>(this.collection);
  setAll = setAll<T>(this.collection);
}
class FirebaseEventSourcedStore<
  P extends FirestoreDocument,
  T extends FirestoreEvent
> extends FirebaseDocumentStore<P> implements EventSourcedStore<P, T> {
  events(id: string): EventStore<T> {
    const events = this.db.collection(`/${this.name}/${id}/events`);
    return new FirebaseEventStore<T>(events, this.db);
  }
}

class FirebaseStore implements Store {
  underlying: FirebaseFirestore.Firestore;
  tokens: DocumentStore<any>;

  private initializeApp(config: FirebaseConfig): admin.app.App {
    const secret = {
      projectId: config.projectId,
      clientEmail: config.clientEmail,
      privateKey: config.privateKey
    };
    return firebase.initializeApp({
      projectId: config.projectId,
      credential: firebase.credential.cert(secret),
      databaseURL: config.dbUrl
    });
  }
  private initializeTestApp(config: FirebaseConfig): admin.app.App {
    return firebase.initializeApp(
      {
        projectId: config.projectId,
        databaseURL: config.dbUrl
      },
      config.appName
    );
  }
  constructor(config: FirebaseConfig) {
    const app =
      config.mode === FirebaseMode.PROD
        ? this.initializeApp(config)
        : this.initializeTestApp(config);

    const db = app.firestore();

    this.underlying = db;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.tokens = new FirebaseDocumentStore<any>(db.collection('tokens'), db);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log('✔ connection to firebase', config.projectId, config.dbUrl);
  }
}
export default FirebaseStore;
