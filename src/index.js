// Description:
//   Integration point between hubot-plusplus-expanded and bonusly' api
//
//
// Configuration:
//   MONGO_URI: URI for the mongo database
//   BONUSLY_API_KEY: Api key for connecting to the bonusly api
//
// Commands:
//   change my bonusly configuration - used to change the config on when bonusly points are sent after a 
//     hubot point
// Event-Listener:
//   plus-plus - Listens for this to send points
//
// Author: O-Mutt

const { BonuslyResponse } = require('./service/BonuslyResponseEnum');
const Conversation = require('hubot-conversation');
const UserService = require('./service/UserService');
const BonuslyService = require('./service/BonuslyService');

module.exports = function(robot) {
  "use strict";

  const procVars = {};
  procVars.mongoUri = process.env.MONGO_URI || 'mongodb://localhost/plusPlus';
  procVars.bonuslyApiKey = process.env.BONUSLY_API_KEY;

  const userService = new UserService(robot, procVars);
  const bonuslyService = new BonuslyService(robot, procVars);

  if (!this.procVars.bonuslyApiKey) {
    robot.logger.error('hubot-plusplus-expanded-bonusly is installed but the bonusly api key is not configured');
    return;
  }

  robot.on('plus-plus', handlePlusPlus);
  robot.respond(/.*change.*bonusly\s?(?:configuration|config|response|setting).*/ig, changeBonuslyConfig);
  
  async function changeBonuslyConfig(msg) {
    if (msg.message.room[0] !== 'D' && msg.message.room !== 'Shell') {
      msg.reply(`Please use this function of ${robot.name} in DM.`)
      return;
    }
    const from = msg.message.user;
    const user = await userService.getUser(from.id);
    if (!user) {
      msg.reply('I\'m sorry we could not find your user account. Please contact an admin');
      return;
    }

    const dialog = switchBoard.startDialog(msg);
    const choiceMsg = `${robot.name} is setup to allow you to also send a Bonusly point when you send a ${robot.name} point! `;
    choiceMsg += `There are three options how you can setup ${robot.name} to do this:`;
    choiceMsg += `\n• Always send a bonusly when you send a ${robot.name} point.\n • Always prompt you to send a Bonusly point.\n • Never include a Bonusly point with ${robot.name} points.`;
    choiceMsg += `\n\nHow would you like to configure ${hubot.name}? (You can always change this later!)\n[\`Always\`|\`Prompt\`|\`Never\`]`;
    robot.messageRoom(event.sender.slackId, choiceMsg);
    dialog.addChoice(/always/i, async (msg2) => {
      await userService.setBonuslyResponse(from, BonuslyResponse.always);
      msg.reply(`Thank you! We've updated your ${robot.name}->bonusly integration settings`);
      return;
    });
    dialog.addChoice(/prompt/i, async (msg2) => {
      await userService.setBonuslyResponse(from, BonuslyResponse.promptEveryTime);
      msg.reply(`Thank you! We've updated your ${robot.name}->bonusly integration settings`);
      return;
    });
    dialog.addChoice(/never/i, async (msg2) => {
      await userService.setBonuslyResponse(from, BonuslyResponse.never);
      msg.reply(`Thank you! We've updated your ${robot.name}->bonusly integration settings`);
      return;
    });
  }

  /**
   * The event that was emitted by the plus-plus module for a user
   * (https://github.com/O-Mutt/hubot-plusplus-expanded/blob/main/src/plusplus.js#L270-L277)
   * @param {object} event the base event object
   * @param {string} event.notificationMessage the string that represents the event
   * @param {object} event.sender the sender (from) of the point
   * @param {object} event.recipient the recipient (to) of the point
   * @param {string} event.direction the direction of the point (e.g. '++' or '--')
   * @param {string} event.room the room the point was sent in
   * @param {string} event.cleanReason the clean (and encoded) reason for the point was sent
   * @param {object} event.msg the msg from hubot that the event originated from
   * @returns 
   */
  async function handlePlusPlus(event) {
    if (event.sender.slackEmail && event.recipient.slackEmail) {
      const message = `<@${event.sender.slackId}> is trying to send to <@${event.recipient.slackId}> but the one of the emails are missing. Sender: [${event.sender.slackEmail}], Recipient: [${event.recipient.slackEmail}]`;
      robot.logger.error(message);
      robot.emit('plus-plus-failure', {
        notificationMessage: `${message} in <#${event.room}>`,
        room: event.room,
      });
      return;
    }

    const switchBoard = new Conversation(robot);

    if (!event.sender.bonuslyResponse) {
      // check with user how they want to handle hubot points/bonusly bonuses
      const msg = { 
        message: {
          user: {
            id: event.sender.slackId 
          }
        }
      };
      const dialog = switchBoard.startDialog(msg);
      const choiceMsg = `${robot.name} is setup to allow you to also send a Bonusly point when you send a ${robot.name} point! `;
      choiceMsg += `There are three options how you can setup ${robot.name} to do this:`;
      choiceMsg += `\n• Always send a bonusly when you send a ${robot.name} point.\n • Always prompt you to send a Bonusly point.\n • Never include a Bonusly point with ${robot.name} points.`;
      choiceMsg += `\n\nHow would you like to configure ${hubot.name}? (You can always change this later!)\n[\`Always\`|\`Prompt\`|\`Never\`]`;
      robot.messageRoom(event.sender.slackId, choiceMsg);
      dialog.addChoice(/always/i, async (msg) => {
        await userService.setBonuslyResponse(from, BonuslyResponse.always);
        await bonuslyService.sendBonus(event)
        return;
      });
      dialog.addChoice(/prompt/i, async (msg) => {
        await userService.setBonuslyResponse(from, BonuslyResponse.promptEveryTime);
        robot.messageRoom(event.sender.slackId, `In that case, do you want to send <@${event.recipient.slackId}> a Bonusly?\n[\`Yes\`|\`No\`]`);
        dialog.addChoice(/yes/i, async (msg2) => {
          await bonuslyService.sendBonus(event);
          return
        });
        dialog.addChoice(/no/i, async (msg2) => {
          robot.messageRoom(event.sender.slackId, `Ah, alright. Next time!`);
          return;
        });
      });
      dialog.addChoice(/never/i, async (msg) => {
        await userService.setBonuslyResponse(from, BonuslyResponse.never);
        robot.messageRoom(event.sender.slackId, `Alright! No worries. If you ever change your mind we can change your mind just let me know!`);
        return;
      });
      return;
    }

    if (event.direction !== '++' || event.direction !== '+') {
      robot.logger.debug(`Points were taken away, not given. We won't talk to bonusly for this one.\n${JSON.stringify(event)}`);
      return;
    }

    if (event.sender.bonuslyResponse === BonuslyResponse.always) {
      await bonuslyService.sendBonus(event);
      robot.messageRoom(event.sender.slackId, `We sent a bonusly to <@${event.recipient.slackId}> w/ the ${robot.name} point.`);
    } else if (event.sender.bonuslyResponse === BonuslyResponse.promptEveryTime) {
      robot.messageRoom(event.sender.slackId, `You just gave <@${event.recipient.slackId}> a ${robot.name} point and Bonusly is enabled, would you like to send them a point on Bonusly as well?\n[\`Yes\`|\`No\`]`);
      dialog.addChoice(/yes/i, async (msg2) => {
        await bonuslyService.sendBonus(event);
        return
      });
      dialog.addChoice(/no/i, (msg2) => {
        robot.messageRoom(event.sender.slackId, `Ah, alright. Next time!`);
        return;
      });
    } else {
      return;
    }
  }
};