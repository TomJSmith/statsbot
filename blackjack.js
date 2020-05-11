module.exports.listeners = [
  { event: 'message', handler: messageHandler },
];

const discord = require('discord.js');
const cards = require('./util/cards.js');

const startText = '-blackjack';
const hit = /^hit$/gi;
const stand = /^stand$/gi;

// TODO
// use map to track multiple games at once
// each channel can have 1 active game
const game = {
  activePlayer: null,
  channel: null,
  dealer: [],
  deck: cards.shuffledDeck(),
  players: [],
  state: 'pending',
};

async function messageHandler(msg) {
  try {
    switch (game.state) {
    case 'pending':
      if (startText !== msg.cleanContent)
        break;

      game.channel = msg.channel;
      game.state = 'starting';

      for (const player of await getPlayers(msg.channel))
        game.players.push({ user: player, cards: [], bet: 0 });

      msg.reply('Place your bets');
      game.state = 'betting';

      setTimeout(async () => {
        deal();
        // TODO
        // show players cards and bets
        game.state = 'playing';
        game.activePlayer = 0;
        await game.channel.send(toString(game.players[game.activePlayer]));
        await game.channel.send('Hit or Stand?');
      }, 1000);
      break;

    case 'betting':
      // TODO
      break;

    case 'playing':
      if (msg.author !== game.players[game.activePlayer].user)
        return;

      if (hit.test(msg.content))
        game.players[game.activePlayer].cards.push(game.deck.pop());

      if (isBust(game.players[game.activePlayer].cards) || stand.test(msg.content)) {
        game.activePlayer++;
        if (game.activePlayer >= game.players.length) {
          hitDealer();
          await finish();
          break;
        }
      }

      await game.channel.send(toString(game.players[game.activePlayer]));
      await game.channel.send('Hit or Stand?');
      break;
    }
  }
  catch(e) {
    console.log(e);
  }
}

async function getPlayers(channel) {
  const embed = new discord.MessageEmbed();
  // TODO reduce method calls
  embed.setTitle('A game of Blackjack is starting in 20 seconds!');
  embed.setColor('LUMINOUS_VIVID_PINK');
  embed.setDescription('Click the die to join.');

  const startingMsg = await channel.send({ embed });
  await startingMsg.react('🎲');

  const reactions = await startingMsg.awaitReactions((r) => r.emoji.name === '🎲', { time: 5000 });
  return (await reactions.first().users.fetch()).filter(u => !u.bot);
}

function deal() {
  for (const p of game.players.concat(game.dealer))
    p.cards.push(game.deck.pop());
  for (const p of game.players.concat(game.dealer))
    p.cards.push(game.deck.pop());
}

function isBust(hand) {
  let sum = 0;
  for (const card of hand)
    sum += Math.min(card.value, 10);

  return sum > 21;
}

async function hitDealer() {
  // use blackjack rules to decide if dealer hits
  // send message for what dealer does
}

async function finish() {
  await game.channel.send('Game finished!\nFinal Hands:');
  for (const p of game.players)
    await game.channel.send(toString(p));
  // determine winners
  // calculate payouts
  // display results
  // set game state pending
}

function toString(player) {
  return `${player.user.username}\n ${player.cards.map(cards.toString).join(', ')}`;
}
