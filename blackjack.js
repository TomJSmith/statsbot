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
  dealer: { name: 'Dealer', cards: [] },
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
        // TODO
        // look up channel nickname for player name
        game.players.push({ user: player, name: player.username, cards: [], bet: 0, cash: 300 });

      await game.channel.send({ embed: embedMessage([game.dealer].concat(game.players), 'Game Start!') });
      await game.channel.send({ embed: embedMessage([], 'Place your bets', '', `Send '1234' to place a bet.`) });

      game.state = 'betting';

      setTimeout(async () => {
        for (const p of game.players) {
          p.cards.push(game.deck.pop());
          p.cards.push(game.deck.pop());
        }
        game.dealer.cards.push(game.deck.pop());
        game.dealer.cards.push(game.deck.pop());

        game.state = 'playing';
        game.activePlayer = 0;
        await game.channel.send({ embed: embedMessage([game.dealer].concat(game.players), 'Betting Concluded') });
        await game.channel.send('Hit or Stand?');
      }, 1000);
      break;

    case 'betting':

      break;

    case 'playing':
      if (msg.author !== game.players[game.activePlayer].user)
        return;

      if (hit.test(msg.content)) {
        game.players[game.activePlayer].cards.push(game.deck.pop());

        if (!isValid(game.players[game.activePlayer].cards)) {
          game.channel.send({ embed: embedMessage(game.players[game.activePlayer], 'Bust') });
          game.activePlayer++;
        }
      }

      if (stand.test())
        game.activePlayer++;

      if (game.activePlayer >= game.players.length) {
        hitDealer();
        await finish(game);
        break;
      }

      await game.channel.send({ embed: embedMessage(game.players[game.activePlayer], `${game.players[game.activePlayer].name}, hit or stand?`) });
      break;
    }
  }
  catch(e) {
    console.log(e);
  }
}

async function getPlayers(channel) {
  const startingMsg = await channel.send({
    embed: new discord.MessageEmbed({
      title: 'A game of Blackjack is starting in 20 seconds!',
      color: 'LUMINOUS_VIVID_PINK',
      description: 'Click the die to join',
    }),
  });
  await startingMsg.react('🎲');

  const reactions = await startingMsg.awaitReactions((r) => r.emoji.name === '🎲', { time: 5000 });

  const diceEmoji = reactions.get('🎲');
  if (!diceEmoji)
    return [];

  const us = await diceEmoji.users.fetch();
  return us.filter(u => !u.bot);
}

function isValid(hand) {
  let sum = 0;
  for (const card of hand)
    sum += Math.min(card.value, 10);

  return sum < 22;
}

async function hitDealer() {
  // use blackjack rules to decide if dealer hits
  // send message for what dealer does
}

async function finish(aGame) {
  await game.channel.send({ embed: embedMessage([game.dealer].concat(game.players), 'Game finished!') });
  // determine winners
  // calculate payouts
  // display results
  // set game state pending
}

function embedMessage(players, title, description, footer) {
  const msg = discord.MessageEmbed({ title, description, footer });
  for (const p of players)
    msg.addField(
      p.name,
      `Hand:${p.cards.length ? p.cards.map(cards.toString).join('|') : 'empty'}
      Bet:$${p.bet}
      Cash:$${p.cash}`);
}