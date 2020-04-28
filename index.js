require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const rollRegex = /(^|\s+)[0-9]*(d|D)[0-9]+($|\s+)/g;
const octaveRegex = /^_/g;
const bofaRegex = \bBOFA\b/gi;

// inclusize min, exclusive max
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function handleDiceMsg(msg) {
  const rolls = {};
  let dice;
  rollRegex.lastIndex = 0;

  while ((dice = rollRegex.exec(msg.cleanContent)) !== null) {
    const nums = dice[0].toLowerCase().split('d').map(v => v === '' ? 1 : parseInt(v));
    for (let i = 0; i < nums[0]; i++) {
      if (!rolls[nums[1]]) {
        rolls[nums[1]] = [];
      }
      rolls[nums[1]].push(getRandomInt(1, nums[1] + 1));
    }
  }

  const total = Object.values(rolls).flat().reduce((acc, curr) => acc + curr);
  const reply = new Discord.MessageEmbed();
  reply.setTitle(`${total}`);
  reply.setColor('0xff0000');
  Object.entries(rolls).forEach(kvp => reply.addField(`${kvp[1].length} d${kvp[0]} (${kvp[1].reduce((a, c) => a + c)})`, `${kvp[1].join(', ')}`));
  msg.reply(reply);
}

function handleOctaveMsg(msg) {
  if (msg.channel.name != 'skynet') {
    msg.reply('Hey! this goes in the bot channel!');
  }
}

function handleBofaMsg(msg) {
  msg.reply('BOFA DEEZ NUTZ');
}

client.on('ready', () => {
  console.log('client ready');
});

client.on('message', msg => {
  if (msg.author.id === client.user.id) {
    return;
  }

  if (octaveRegex.test(msg.cleanContent)) {
    try {
      handleOctaveMsg(msg);
    }
    catch {}
  }

  if (rollRegex.test(msg.cleanContent)) {
    try {
      handleDiceMsg(msg);
    }
    catch {}
  }
  if (bofaRegex.test(msg.cleanContent)) {
    try {
      handleBofaMsg(msg);
    }
    catch {}
  }
});


client.login(process.env.BOT_TOKEN);
