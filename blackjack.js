module.exports.listeners = [
  { event: 'message', handler: messageHandler },
];

const discord = require('discord.js');
const cards = require('./util/cards.js');

const start = /^-blackjack$/i;
const hit = /^hit$/i;
const stand = /^stand$/i;
const bet = /^[0-9]+$/i;

// TODO
// use map to track multiple games at once
// each channel can have 1 active game
let currGame = game();

async function messageHandler(msg) {
  try {
    switch (currGame.state) {
    case 'pending':
      if (!start.test(msg.content))
        break;

      currGame.channel = msg.channel;
      currGame.state = 'starting';

      // TODO
      // look up channel nickname for player name
      for (const player of await getPlayers(msg.channel))
        currGame.players.push({ user: player, name: player.username, cash: 300 });

      if (currGame.players.length === 0) {
        await currGame.channel.send({ embed: embedMessage([], 'Game cannot start without players!', 'Make sure to click the die to join the game') });
        currGame = game();
      }

      await currGame.channel.send({ embed: embedMessage([], 'Game Start!') });
      await currGame.channel.send({ embed: embedMessage([currGame.dealer, ...currGame.players], 'Place your bets', '', 'Send 1234 to place a bet.') });

      currGame.state = 'betting';

      setTimeout(async () => {
        for (const p of currGame.players) {
          p.cash -= p.bet || 0;
          p.cards = [currGame.deck.pop(), currGame.deck.pop()];
        }

        currGame.dealer.cards = [currGame.deck.pop(), currGame.deck.pop()];

        currGame.state = 'hitting';
        currGame.activePlayer = 0;
        await currGame.channel.send({ embed: embedMessage([currGame.dealer, ...currGame.players], 'Betting concluded. Cards dealt.') });
        await currGame.channel.send({ embed: embedMessage([currGame.dealer, currGame.players[currGame.activePlayer]], `${currGame.players[currGame.activePlayer].name}, Hit or Stand?`) });
      }, 10000);
      break;

    case 'betting':
      if (!bet.test(msg.content))
        break;

      // eslint-disable-next-line no-case-declarations
      const better = currGame.players.find(p => p.user === msg.author);
      if (!better)
        break;

      better.bet = Math.min(parseInt(msg.content), better.cash);
      break;

    case 'hitting':
      if (currGame.activePlayer >= currGame.players.length || msg.author !== currGame.players[currGame.activePlayer].user)
        return;

      if (hit.test(msg.content)) {
        currGame.players[currGame.activePlayer].cards.push(currGame.deck.pop());

        if (!isValid(currGame.players[currGame.activePlayer].cards)) {
          await currGame.channel.send({ embed: embedMessage([currGame.players[currGame.activePlayer]], `${currGame.players[currGame.activePlayer].name}, bust!`, 'Better luck next time.') });
          currGame.activePlayer++;
        }
      }

      if (stand.test(msg.content))
        currGame.activePlayer++;

      if (currGame.activePlayer >= currGame.players.length) {
        while (dealerShouldHit(currGame))
          currGame.dealer.cards.push(currGame.deck.pop());
        await finish(currGame);
        break;
      }

      await currGame.channel.send({ embed: embedMessage([currGame.dealer, currGame.players[currGame.activePlayer]], `${currGame.players[currGame.activePlayer].name}, hit or stand?`) });
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

// Dealer should hit if hand total is bellow 17 (aces are counted high)
function dealerShouldHit(aGame) {
  let handTotal = 0;
  for (const c of aGame.dealer.cards)
    handTotal += c.value === 1 ? 11 : Math.min(c.value, 10);

  return handTotal < 17;
}

async function finish(aGame) {
  await currGame.channel.send({ embed: embedMessage([aGame.dealer, ...aGame.players], 'Game finished!', '', false) });
  currGame = game();
  // determine winners
  // calculate payouts
  // display results
  // set game state pending
}

function embedMessage(players = [], title = '', description = '', footer = '', hideDealer = true) {
  const msg = new discord.MessageEmbed({ title, description, footer: { text: footer }, color: 'LUMINOUS_VIVID_PINK' });

  for (const p of players) {
    const values = [
      p.cards !== undefined ? (p.dealer && hideDealer ? [cards.toEmoji(p.cards[0]), ...p.cards.slice(1).map(() => '❓')] : p.cards.map(cards.toEmoji)).join('|') : null,
      p.bet !== undefined ? 'Bet: $' + p.bet : null,
      p.cash !== undefined ? 'Cash: $' + p.cash : null,
    ].filter(Boolean);
    msg.addField(p.name, values.length ? values.join('\n') : '\u200b', true);
  }

  return msg;
}

function game() {
  return {
    activePlayer: null,
    channel: null,
    dealer: { name: 'Dealer', dealer: true },
    deck: cards.shuffledDeck(),
    players: [],
    state: 'pending',
  };
}