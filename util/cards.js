module.exports = { deck, shuffle, shuffledDeck, toString, toEmoji };

const suits = ['diamonds', 'spades', 'clubs', 'hearts'];
const values = [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
const cardValues = new Map([
  [13, 'K'],
  [12, 'Q'],
  [11, 'J'],
  [10, '10'],
  [9, '9'],
  [8, '8'],
  [7, '7'],
  [6, '6'],
  [5, '5'],
  [4, '4'],
  [3, '3'],
  [2, '2'],
  [1, 'A'],
]);
const cardSuits = new Map([
  ['clubs', '♣️'],
  ['diamonds', '♦️'],
  ['hearts', '♥️'],
  ['spades', '♠️'],
]);

function deck() {
  return suits.map(s => values.map(v => ({ suit: s, value: v }))).flat();
}

function shuffle(aDeck) {
  let currentIndex = aDeck.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = aDeck[currentIndex];
    aDeck[currentIndex] = aDeck[randomIndex];
    aDeck[randomIndex] = temporaryValue;
  }

  return aDeck;
}

function shuffledDeck() {
  return shuffle(deck());
}

function toEmoji(card) {
  return `${cardValues.get(card.value)}${cardSuits.get(card.suit)}`;
}

function toString(card) {
  return `${card.value} of ${card.suit}`;
}
