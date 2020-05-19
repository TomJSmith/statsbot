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
let currGame = game();

async function messageHandler(msg) {
  try {
    switch (currGame.state) {
    case 'pending':
      if (startText !== msg.cleanContent)
        break;

      currGame.channel = msg.channel;
      currGame.state = 'starting';

      // TODO
      // look up channel nickname for player name
      for (const player of await getPlayers(msg.channel))
        currGame.players.push({ user: player, name: player.username, cards: [], bet: 0, cash: 300 });

      if (currGame.players.length === 0) {
        await currGame.channel.send({ embed: embedMessage([], 'Game cannot start without players!', 'Make sure to click the die to join the game') });
        currGame = game();
      }

      await currGame.channel.send({ embed: embedMessage([], 'Game Start!') });
      await currGame.channel.send({ embed: embedMessage([currGame.dealer].concat(currGame.players), 'Place your bets', '', 'Send 1234 to place a bet.') });

      currGame.state = 'betting';

      setTimeout(async () => {
        for (const p of currGame.players) {
          p.cards.push(currGame.deck.pop());
          p.cards.push(currGame.deck.pop());
        }
        currGame.dealer.cards.push(currGame.deck.pop());
        currGame.dealer.cards.push(currGame.deck.pop());

        currGame.state = 'playing';
        currGame.activePlayer = 0;
        await currGame.channel.send({ embed: embedMessage([currGame.dealer].concat(currGame.players), 'Betting has finished.') });
        await currGame.channel.send({ embed: embedMessage([currGame.players[currGame.activePlayer]], `${currGame.players[currGame.activePlayer].name}, Hit or Stand?`) });
      }, 10000);
      break;

    case 'betting':
      // TODO
      // update player's bets and notify that bets have been received
      break;

    case 'playing':
      if (msg.author !== currGame.players[currGame.activePlayer].user)
        return;

      if (hit.test(msg.content)) {
        currGame.players[currGame.activePlayer].cards.push(currGame.deck.pop());

        if (!isValid(currGame.players[currGame.activePlayer].cards)) {
          currGame.channel.send({ embed: embedMessage([currGame.players[currGame.activePlayer]], `${currGame.players[currGame.activePlayer].name}, bust!`, 'Better luck next time.') });
          currGame.activePlayer++;
        }
      }

      if (stand.test(msg.content))
        currGame.activePlayer++;

      if (currGame.activePlayer >= currGame.players.length) {
        hitDealer();
        await finish(currGame);
        break;
      }

      await currGame.channel.send({ embed: embedMessage([currGame.players[currGame.activePlayer], currGame.dealer], `${currGame.players[currGame.activePlayer].name}, hit or stand?`) });
      break;
    }
  }
  catch(e) {
    console.log(e);
  }
}

async function getPlayers(channel) {
  const startingMsg = await channel.send({ embed: embedMessage([], 'A game of Blackjack is starting in 20 seconds!', 'Click the die to join.') });
  await startingMsg.react('🎲');

  const diceEmoji = (await startingMsg.awaitReactions((r) => r.emoji.name === '🎲', { time: 5000 })).get('🎲');
  if (!diceEmoji)
    return [];

  return (await diceEmoji.users.fetch()).filter(u => !u.bot).values();
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
  // dealer hits if bellow 17, stands if 17 or more
  // aces are counted at 11 for dealer
}

async function finish(aGame) {
  await currGame.channel.send({ embed: embedMessage([currGame.dealer].concat(currGame.players), 'Game finished!') });
  // determine winners
  // calculate payouts
  // display results
  // set game state pending
}

function embedMessage(players, title, description, footer) {
  const msg = new discord.MessageEmbed({ title: title || '', description: description || '', footer: { text: footer || '' }, color: 'LUMINOUS_VIVID_PINK' });

  for (const p of players)
    msg.addField(
      p.name,
      // TODO
      // don't show the dealers cards when the game is being played
      `${p.cards ? 'Hand:' + p.cards.length ? p.cards.map(cards.toEmoji).join('|') : 'empty' : 'no hand'}
      ${p.bet ? 'Bet:$' + p.bet : 'no bet'}
      ${p.cash ? 'Cash:$' + p.cash : 'no cash'}`,
      true);

  return msg;
}

function game() {
  return {
    activePlayer: null,
    channel: null,
    dealer: { name: 'Dealer', cards: [] },
    deck: cards.shuffledDeck(),
    players: [],
    state: 'pending',
  };
}