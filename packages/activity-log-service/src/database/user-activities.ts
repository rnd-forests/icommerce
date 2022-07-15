import { MongoCollections } from '../config/mongo';

export const initUserActivityService = (DB: MongoCollections) => ({
  ...DB.userActivities,
});
