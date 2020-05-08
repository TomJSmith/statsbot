const discord = require('discord.js');

const startText = '-blackjack';
let game = null;

async function messageHandler(msg) {
  if (msg.author.bot)
    return;

  if (startText === msg.cleanContent) {
    game = {
      players: [],
      table: [],
      deck: deck(),
    };

    const embed = new discord.MessageEmbed();
    embed.setTitle('A game of Blackjack is starting in 20 seconds!');
    embed.setColor('LUMINOUS_VIVID_PINK');
    embed.setDescription('Click the die to join.');

    const startingMsg = await msg.channel.send({ embed });
    await startingMsg.react('🎲');
    const reactions = await startingMsg.awaitReactions(() => true, { time: 5000 });
    console.log(reactions);
    return;
  }

}

function deck() {
  const suits = ['clubs', 'diamonds', 'hearts', 'spades'];
  const values = [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

  return suits.map(s => values.map(v => ({ suit: s, value: v }))).flat();
}

module.exports.listeners = [
  { event: 'message', handler: messageHandler },
];
