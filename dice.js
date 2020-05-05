const Discord = require('discord.js');
const diceRoll = /\b[0-9]*(d|D)[0-9]+\b/gi;

exports.test = (msg) => {
  return diceRoll.test(msg.cleanContent);
};

exports.handle = (msg) => {
  try {
    const rolls = {};
    let dice;
    diceRoll.lastIndex = 0;

    while ((dice = diceRoll.exec(msg.cleanContent)) !== null) {
      const nums = dice[0].split('d').map(v => v === '' ? 1 : parseInt(v));
      for (let i = 0; i < nums[0]; i++) {
        if (!rolls[nums[1]])
          rolls[nums[1]] = [];

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
  catch {}
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}