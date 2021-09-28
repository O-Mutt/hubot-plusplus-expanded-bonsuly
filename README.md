# hubot-plusplus-expanded-bonusly

## Purpose
This project is intended to be used in conjunction with the [Hubot-PlusPlus-Expanded](https://github.com/O-Mutt/hubot-plusplus-expanded) project to enable the plusplus to also send out [Bonusly Bonuses](https://bonus.ly). 

## Configuration
In order to enable this in your hubot you must set your bonusly api key on the env variable:
```
process.env.MONGO_URI || 'mongodb://localhost/plusPlus';
process.env.BONUSLY_API_KEY;
process.env.BONUSLY_URI;
```
It also uses a bonusly_uri to allow for dev environments (proxys) to be used and a mongo uri to look up users.
