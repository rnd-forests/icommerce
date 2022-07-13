import config from 'config';
import { MongoDB } from '@lib/server';
import { logger } from '.';

export const Mongo = new MongoDB({
  logger,
  databaseName: config.get('mongo.database'),
  databaseUrl: config.get('mongo.auth'),
  collections: (DB, collectionToService) => {
    const userActivities = DB.collection<T.ActivityLog.UserActivityLogSchema>('user_activities');
    return {
      userActivities: collectionToService(userActivities),
    };
  },
});
