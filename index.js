require('dotenv').config();
const dice = require('./dice.js');
const discord = require('discord.js');
const octave = require('./octave.js');
const bofa = require('./bofa.js');

const client = new discord.Client();

client.on('ready', () => {
  console.log('client ready');
});

client.on('message', msg => {
  if (msg.author.id === client.user.id)
    return;

  if (bofa.test(msg))
    bofa.handle(msg);

  if (octave.test(msg))
    octave.handle(msg);

  if (dice.test(msg))
    dice.handle(msg);
});


client.login(process.env.BOT_TOKEN);
