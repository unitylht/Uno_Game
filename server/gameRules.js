const { cards } = require("./cardsData");

const cardsCount = cards.length;

function takeACard(usedCards, playingCards = []) {
  const deckIndices = Array.from({ length: cardsCount }, (_, i) => i + 1);
  const card = deckIndices[Math.floor(Math.random() * cardsCount)];

  if (!usedCards[card]) {
    usedCards[card] = true;
    return card;
  }

  const used = Object.keys(usedCards).filter((key) => usedCards[key]).length;
  if (used >= cardsCount) {
    Object.keys(usedCards).forEach((key) => {
      usedCards[key] = false;
    });
    playingCards.forEach((c) => {
      usedCards[c] = true;
    });

    return takeACard(usedCards, playingCards);
  }

  return takeACard(usedCards, playingCards);
}

function isReverse(cardValue) {
  const card = cards[cardValue - 1];
  return card.special === "reverse";
}

function isSkip(cardValue) {
  const card = cards[cardValue - 1];
  return card.special === "skip";
}

function isWild(cardValue) {
  const card = cards[cardValue - 1];
  return card.special === "wild" || card.special === "wild-drawFour";
}

function isWildDrawFour(cardValue) {
  const card = cards[cardValue - 1];
  return card.special === "wild-drawFour";
}

function isDrawTwo(cardValue) {
  const card = cards[cardValue - 1];
  return card.special === "drawTwo";
}

function isAllowedToThrow(newCard, cardPile, color, drawCount, playerCards) {
  const newCardData = cards[newCard - 1];
  const pileCardData = cards[cardPile - 1];

  if (drawCount > 0) {
    if (
      (pileCardData.special === "wild-drawFour" &&
        newCardData.special === "wild-drawFour") ||
      (pileCardData.special === "drawTwo" && newCardData.special === "drawTwo")
    ) {
      return true;
    }
    return false;
  }

  if (newCardData.special === "wild-drawFour") {
    const hasSameColor = playerCards.find((card) => {
      if (pileCardData.color) {
        return cards[card - 1].color === pileCardData.color;
      }
      if (color) {
        return cards[card - 1].color === color;
      }
      return false;
    });

    return !hasSameColor;
  }

  return (
    (newCardData.number != null && newCardData.number === pileCardData.number) ||
    newCardData.color === pileCardData.color ||
    ((pileCardData.special === "wild" ||
      pileCardData.special === "wild-drawFour") &&
      newCardData.color === color) ||
    (newCardData.special != null &&
      newCardData.special === pileCardData.special) ||
    newCardData.special === "wild"
  );
}

function getPlayingCards(room) {
  const cardsOnTable = [];
  room.players.forEach((player) => {
    cardsOnTable.push(...(player.cards || []));
  });
  if (room.discardPile) {
    cardsOnTable.push(room.discardPile);
  }
  return cardsOnTable;
}

function verifyYellPlayer(room) {
  if (room.currentMove === room.yellOne) {
    return room.yellOne;
  }
  return null;
}

module.exports = {
  cards,
  cardsCount,
  takeACard,
  isReverse,
  isSkip,
  isWild,
  isWildDrawFour,
  isDrawTwo,
  isAllowedToThrow,
  getPlayingCards,
  verifyYellPlayer,
};
