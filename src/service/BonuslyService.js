const Axios = require('axios');

class BonuslyService {
  constructor(robot, procVars) {
    this.robot = robot;
    this.apiKey = procVars.bonuslyApiKey;
    this.url = procVars.bonuslyUri;
    this.axios = Axios.create({
      baseURL: procVars.bonuslyUri,
      headers: {
        Authorization: `Bearer ${procVars.bonuslyApiKey}`,
      },
    });
  }

  /**
   *
   * @param {string} slackId the slack id of the user to find
   * @returns the user from the scores db, undefined if not found
   */
  async sendBonus(event) {
    this.robot.logger.debug(`Sending a bonusly bonus to ${JSON.stringify(event.recipient.slackEmail)} from ${JSON.stringify(event.sender.slackEmail)}`);
    let reason = `point given through ${this.robot.name}`;
    if (event.reason) {
      const buff = new Buffer.from(event.reason, 'base64');
      reason = buff.toString('UTF-8');
    }

    let data;
    try {
      ({ data } = await this.axios.post('/api/v1/bonuses', {
        giver_email: event.sender.slackEmail,
        receiver_email: event.recipient.slackEmail,
        amount: event.amount,
        hashtag: '#excellence',
        reason,
      }));
    } catch (e) {
      this.robot.logger.error('Error sending bonusly bonus', e);
      data = e.response.data;
    }

    return data;
  }
}

module.exports = BonuslyService;
