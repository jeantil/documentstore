import FirebaseStore from './firebase';
import InMemoryStore from './inmemory';
import { Maybe } from 'monet';
import FirebaseConfig, { FirebaseMode } from './FirebaseConfig';

export interface FirestoreDocument {
  id: string;
}
export interface FirestoreEvent extends FirestoreDocument {
  timestamp: string;
}
export interface SingleWriteResult {
  id: string;
  result: Date;
}

export interface DocumentStore<T> {
  name: string;
  get(id: string): Promise<T>;
  getOpt(id: string): Promise<Maybe<T>>;
  save<P extends T>(id: string, data: P): Promise<SingleWriteResult>;
  merge<P extends T>(
    id: string,
    data: P,
    mergeFields?: string[]
  ): Promise<SingleWriteResult>;
  delete(id: string): Promise<SingleWriteResult>;
  getAll(orderBy?: string): Promise<T[]>;
}
export interface EventStore<T extends FirestoreEvent> extends DocumentStore<T> {
  getAll(): Promise<T[]>;
  setAll(documents: T[]): Promise<SingleWriteResult[]>;
}

export interface EventSourcedStore<P, T extends FirestoreEvent>
  extends DocumentStore<P> {
  events(id: string): EventStore<T>;
}

export interface Store {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tokens: DocumentStore<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  close(): Promise<void>;
}

const StoreProvider = (config: FirebaseConfig): Store => {
  switch (config.mode) {
    case FirebaseMode.MEMORY:
      return new InMemoryStore();
    default:
      return new FirebaseStore(config);
  }
};

export default StoreProvider;
export { FirebaseStore };
