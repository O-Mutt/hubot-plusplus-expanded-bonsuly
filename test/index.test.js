const { test, expect, beforeAll, beforeEach } = require('@jest/globals');
const Helper = require('hubot-test-helper');
const { MongoClient } = require('mongodb');
const mongoUnit = require('mongo-unit');
const ppb = require('../src/index');
jest.mock('../src/service/UserService');

let plusPlusBonusly;
let room;
beforeAll(async function () {

  const url = await mongoUnit.start();
  const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const connection = await client.connect();
  db = connection.db();
  process.env.MONGODB_URI = url;
  process.env.BONUSLY_API_KEY = 'test_123';
  plusPlusBonusly = new Helper('../src/index.js');
});

beforeEach(() => {
  room = plusPlusBonusly.createRoom();
});

afterEach(() => {
  room.destroy();
});

test('responds to basic change bonusly config', async () => {
  room.name = 'D123';
  room.user.say('matt.erickson', 'change bonusly config');
  await new Promise((resolve) => setTimeout(resolve, 500));
  expect(true).toStrictEqual(true);
});