require('dotenv').config();
const discord = require('discord.js');
const modules = [
  require('./dice.js'),
  require('./octave.js'),
  require('./bofa.js'),
  require('./blackjack.js'),
];

const client = new discord.Client();

client.on('ready', () => {
  console.log('client ready');
});

for (const listener of modules.map(m => m.listeners).flat())
  client.on(listener.event, listener.handler);

client.login(process.env.BOT_TOKEN);
