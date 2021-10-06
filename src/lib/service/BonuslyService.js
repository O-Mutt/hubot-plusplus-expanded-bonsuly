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
        'Content-Type': 'application/json',
      },
    });
    this.defaultReason = procVars.bonuslyDefaultReason || `point given through <@${this.robot.id}>`;
    this.defaultHashtag = procVars.bonuslyDefaultHashtag || '#1team1score';
  }

  /**
   *
   * @param {string} slackId the slack id of the user to find
   * @returns the user from the scores db, undefined if not found
   */
  async sendBonus(event) {
    this.robot.logger.debug(`Sending a bonusly bonus to ${JSON.stringify(event.recipient.slackEmail)} from ${JSON.stringify(event.sender.slackEmail)}`);
    let reason = this.defaultReason;
    if (event.reason) {
      const buff = new Buffer.from(event.reason, 'base64');
      reason = buff.toString('UTF-8');
    }

    let hashtag = this.defaultHashtag;
    if (reason && /(#\w+)/i.test(reason)) {
      const match = reason.match(/(#\w+)/i);
      hashtag = match ? match[0] : this.defaultHashtag;
    }

    let data;
    if (event.amount === 1) {
      event.amount = 1;
    }
    try {
      ({ data } = await this.axios.post('/api/v1/bonuses', {
        giver_email: event.sender.slackEmail,
        receiver_email: event.recipient.slackEmail,
        amount: event.amount,
        hashtag,
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
