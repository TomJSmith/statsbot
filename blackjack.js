module.exports.listeners = [
  { event: 'message', handler: messageHandler },
];

const discord = require('discord.js');
const cards = require('./util/cards.js');

const startText = '-blackjack';
const hit = /^hit$/gi;
const stand = /^stand$/gi;

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

      setTimeout(() => {
        deal();
        // TODO
        // show players cards and bets
        game.state = 'playing';
        game.activePlayer = 0;
        askHitOrStand(game.players[game.activePlayer]);
      }, 5000);
      break;

    case 'betting':
      // TODO
      break;

    case 'playing':
      if (msg.author !== game.players[game.activePlayer])
        return;

      if (hit.test(msg.content))
        game.players[game.activePlayer].cards.push(game.deck.pop());

      game.channel.send(game.players[game.activePlayer].cards);

      if (busted(game.players[game.activeplayer].cards) || stand.test(msg.content)) {
        game.activePlayer++;
        if (game.activePlayer >= game.players.length) {
          hitDealer();
          finish();
          break;
        }
      }

      askHitOrStand(game.players[game.activePlayer]);
      break;
    }
  }
  catch(e) {
    console.log(e);
  }
}

async function getPlayers(channel) {
  const embed = new discord.MessageEmbed();
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

function busted(hand) {
  let sum = 0;
  for (const card in hand)
    sum += Math.max(card.value, 10);

  return sum > 21;
}

function hitDealer() {
  // use blackjack rules to decide if dealer hits
  // send message for what dealer does
}

function finish() {
  game.channel.send('game finished');
  // determine winners
  // calculate payouts
  // display results
  // set game state pending
}

function askHitOrStand(player) {
  game.channel.send(`${player.user.username} ${player.cards} hit or stand?`);
}
