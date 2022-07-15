import { MongoCollections } from '../config/mongo';
import { initUserActivityService } from './user-activities';

export class DBServices {
  public static userActivities: MongoCollections['userActivities'];

  static init(DB: MongoCollections) {
    this.userActivities = initUserActivityService(DB);
  }
}
