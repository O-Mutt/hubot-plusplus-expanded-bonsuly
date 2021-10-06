//
// Description
//  This is the entry point for the settings post backs from hubot settings.
//
// Author:
//  O'Mutt (Matthew O'Keefe)
//
module.exports = function (robot) {
  robot.router.post('/bonusly/settings', (req, res) => {
    const data = req.body.payload ? JSON.parse(req.body.payload) : req.body;
    const response = data.bonuslyResponse;
    console.log(req);
  });
  console.log(robot);
};
