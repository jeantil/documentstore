/* eslint-disable @typescript-eslint/no-unused-vars */
import { Store, SingleWriteResult, DocumentStore } from '..';

import { Maybe } from 'monet';

class InMemoryDocumentStore<T> implements DocumentStore<T> {
  protected _store: { [Key: string]: T };
  constructor(readonly name: string) {
    this._store = {};
  }
  get(id: string): Promise<T> {
    const element = this._store[id];
    if (!element) Promise.reject(new Error('No such element ' + id));
    return Promise.resolve(element);
  }
  getOpt(id: string): Promise<Maybe<T>> {
    const element = this._store[id];
    return Promise.resolve(Maybe.fromNull(element));
  }
  save<P extends T>(id: string, data: T): Promise<SingleWriteResult> {
    this._store[id] = data;
    return Promise.resolve({ id: id, result: new Date() });
  }
  merge<T>(
    id: string,
    data: T,
    mergeFields?: string[]
  ): Promise<SingleWriteResult> {
    throw new Error('Method not implemented.');
  }
  delete(id: string): Promise<SingleWriteResult> {
    delete this._store[id];
    return Promise.resolve({ id: id, result: new Date() });
  }
  getAll(orderBy?: string): Promise<T[]> {
    return Promise.resolve(Object.values(this._store));
  }
}

export default class InMemoryStore implements Store {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tokens: DocumentStore<any> = new InMemoryDocumentStore<any>('tokens');
}
