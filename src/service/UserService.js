
export class UserService {
  constructor(robot, procVars) {
    this.db = undefined;
    this.robot = robot;
    this.uri = procVars.mongoUri;
    this.init(); // this is async but should kick off the connection
  }

  async init() {
    const client = new MongoClient(this.uri,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    const connection = await client.connect();
    this.db = connection.db();
  }

  async getDb() {
    if (!this.db) {
      await this.init();
    }
    return this.db;
  }

  /**
   * 
   * @param {string} slackId the slack id of the user to find
   * @returns the user from the scores db, undefined if not found
   */
  async getUser(slackId) {
    const db = await this.getDb();

    const dbUser = await db.collection('scores').findOne(
      { slackId: slackId },
      { sort: { score: -1 } },
    );

    return dbUser;
  }

  async setBonuslyResponse(user, response) {
    const db = await this.getDb();

    const resp = await db.collection('scores').updateOne(
      { slackId: user.slackId },
      { $set: { bonuslyResponse: response } },
      { sort: { score: -1 } },
    );
    return;
  }
}