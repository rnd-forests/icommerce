/* eslint-disable no-await-in-loop */

import exitHook from 'async-exit-hook';
import { Db, MongoClient } from 'mongodb';
import { ICommerceDebugger } from '@lib/common';
import { collectionToService } from './collection';

interface MongoDBOpts<C> {
  databaseName: string;
  databaseUrl: string;
  collections: (DB: Db, fn: typeof collectionToService) => C;
  logger: ICommerceDebugger;
}

export class MongoDB<C> {
  public ready: boolean;

  public DB?: C;

  public client: MongoClient;

  public clientDb?: Db;

  constructor(opts: MongoDBOpts<C>) {
    const { databaseUrl, databaseName, collections, logger } = opts;
    this.ready = false;
    this.client = new MongoClient(databaseUrl);
    this.client.connect(err => {
      if (err) {
        logger.error('[MONGO] connection failed');
        throw err;
      }
      logger.info(`[MONGO] connected to server - ${databaseName}`);
      this.clientDb = this.client.db(databaseName);
      this.DB = collections(this.clientDb, collectionToService);
      this.ready = true;
      exitHook(cb => {
        if (this.client) {
          this.client.close(cb);
        }
      });
    });
  }

  public async waitReady() {
    while (!this.ready || !this.DB) {
      await this._wait(100);
    }
  }

  public async getDB() {
    if (!this.ready) {
      await this.waitReady();
    }
    return this.DB;
  }

  public async getClient() {
    if (!this.ready) {
      await this.waitReady();
    }
    return this.client;
  }

  public getDBUnsafe() {
    return this.DB as C;
  }

  private _wait(duration: number) {
    return new Promise(r => {
      setTimeout(r, duration);
    });
  }
}
