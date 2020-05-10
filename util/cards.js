module.exports = { deck, shuffle, shuffledDeck };

const suits = ['clubs', 'diamonds', 'hearts', 'spades'];
const values = [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

function deck() {
  return suits.map(s => values.map(v => ({ suit: s, value: v }))).flat();
}

function shuffle(d) {
  let currentIndex = d.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = d[currentIndex];
    d[currentIndex] = d[randomIndex];
    d[randomIndex] = temporaryValue;
  }

  return d;
}

function shuffledDeck() {
  return shuffle(deck());
}
