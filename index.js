require('dotenv').config();
import * as dice from 'dice.js';
import * as octave from 'octave.js';
import * as bofa from 'bofa.js';

const Discord = require('discord.js');
const client = new Discord.Client();

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
