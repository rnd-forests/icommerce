import config from 'config';
import { MongoDB, MongoCollection } from '@lib/server';
import { Filter } from 'mongodb';
import { logger } from '.';

export interface MongoCollections {
  userActivities: MongoCollection<T.ActivityLog.UserActivityLogSchema, Filter<T.ActivityLog.UserActivityLogSchema>>;
}

export const Mongo = new MongoDB({
  logger,
  databaseName: config.get('mongo.database'),
  databaseUrl: config.get('mongo.auth'),
  collections: (DB, collectionToService): MongoCollections => ({
    userActivities: collectionToService(DB.collection<T.ActivityLog.UserActivityLogSchema>('user_activities')),
  }),
});
