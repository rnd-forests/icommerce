import {
  Document,
  Collection,
  FindOptions,
  DeleteOptions,
  UpdateOptions,
  DistinctOptions,
  InsertOneOptions,
  BulkWriteOptions,
  AggregateOptions,
  CursorStreamOptions,
  CountDocumentsOptions,
  ReplaceOptions,
  DeleteResult,
  UpdateResult,
  BulkWriteResult,
  InsertOneResult,
  InsertManyResult,
  Filter,
  UpdateFilter,
  WithId,
  FindCursor,
  AggregationCursor,
  OptionalUnlessRequiredId,
} from 'mongodb';
import { Readable } from 'stream';

interface ObjectAny {
  [key: string]: any;
}

interface MongoCollection<S, Q = Filter<S>> {
  find: (query: Q, projection?: Document, opts?: FindOptions) => Promise<WithId<S>[]>;
  findOne: (query: Q, projection?: Document, opts?: FindOptions) => Promise<WithId<S> | null>;
  findCursor: (query: Q, projection?: Document, opts?: FindOptions) => FindCursor<WithId<S>>;
  aggregate: (p: Document[], o?: AggregateOptions) => Promise<S[]>;
  aggregateCursor: (p: Document[], o?: AggregateOptions) => AggregationCursor<S>;
  stream: (query: Q, o?: FindOptions, so?: CursorStreamOptions) => Readable;
  distinct: (fieldName: any, query: Q, o?: DistinctOptions) => Promise<any[]>;
  count: (query: Q, o?: CountDocumentsOptions) => Promise<number>;
  insert: (item: OptionalUnlessRequiredId<S>, opts?: InsertOneOptions) => Promise<InsertOneResult<S>>;
  insertMany: (items: OptionalUnlessRequiredId<S>[], opts?: BulkWriteOptions) => Promise<InsertManyResult<S>>;
  update: (query: Q, update: UpdateFilter<S>, opts?: UpdateOptions) => Promise<UpdateResult>;
  updateBulk: (
    updates: Array<{ find: Q; update: ObjectAny }>,
    type: 'ordered' | 'unordered',
  ) => Promise<BulkWriteResult>;
  replaceOne: (query: Q, item: S, opts?: ReplaceOptions) => Promise<UpdateResult | Document>;
  remove: (query: Q, opts?: DeleteOptions) => Promise<DeleteResult>;
  removeMany: (query: Q, opts?: DeleteOptions) => Promise<DeleteResult>;
  getCollection: () => Collection<S>;
}

export const collectionToService = <S>(collection: Collection<S>): MongoCollection<S> => ({
  async find(query, projection, opts = {}) {
    if (projection) opts.projection = projection;
    const cursor = collection.find(query, opts);
    return cursor.toArray();
  },

  async findOne(query, projection, opts = {}) {
    if (projection) opts.projection = projection;
    return collection.findOne(query, opts);
  },

  findCursor(query, projection, opts = {}) {
    if (projection) opts.projection = projection;
    return collection.find(query, opts);
  },

  async aggregate(pipeline, opts) {
    const cursor = collection.aggregate(pipeline, opts);
    return cursor.toArray() as Promise<S[]>;
  },

  aggregateCursor(pipeline, opts) {
    return collection.aggregate(pipeline, opts);
  },

  stream(query, opts, streamOpts) {
    return collection.find(query, opts).stream(streamOpts);
  },

  async distinct(fieldName, query, opts = {}) {
    return collection.distinct(fieldName, query, opts);
  },

  async count(query, opts = {}) {
    return collection.countDocuments(query, opts);
  },

  async insert(item, opts = {}) {
    return collection.insertOne(item, opts);
  },

  async insertMany(items, opts = {}) {
    return collection.insertMany(items, opts);
  },

  async update(query, update, opts = {}) {
    return collection.updateOne(query, update, opts);
  },

  async updateBulk(updates, type) {
    if (updates.length === 0) {
      return {
        nInserted: 0,
        nUpdated: 0,
        nUpserted: 0,
        nModified: 0,
        nRemoved: 0,
        nMatched: 0,
      } as unknown as BulkWriteResult;
    }
    const bulk = type === 'ordered' ? collection.initializeOrderedBulkOp() : collection.initializeUnorderedBulkOp();
    updates.forEach(operation => bulk.find(operation.find).update(operation.update));
    return bulk.execute();
  },

  async replaceOne(query, item, opts) {
    return collection.replaceOne(query, item, opts || {});
  },

  async remove(query, opts) {
    return collection.deleteOne(query, opts || {});
  },

  async removeMany(query, opts) {
    return collection.deleteMany(query, opts || {});
  },

  getCollection() {
    return collection;
  },
});
