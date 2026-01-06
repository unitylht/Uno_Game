const express = require("express");
const http = require("http");
const cors = require("cors");
const { v4: uuid } = require("uuid");
const WebSocket = require("ws");
const {
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
} = require("./gameRules");

const PORT = process.env.PORT || 4000;
const app = express();
app.use(cors());
app.use(express.json());

const MAX_PLAYERS = 10;
const MIN_PLAYERS = 2;

const rooms = new Map();
const roomSockets = new Map();

app.get("/", (req, res) => {
  res.json({
    message: "Uno Game API server is running",
    endpoints: {
      createRoom: "POST /api/rooms { name }",
      joinRoom: "POST /api/rooms/:roomId/players { name }",
      roomState: "GET /api/rooms/:roomId",
      start: "POST /api/rooms/:roomId/start { playerId }",
      draw: "POST /api/rooms/:roomId/actions/draw { playerId }",
      discard:
        "POST /api/rooms/:roomId/actions/discard { playerId, card, color }",
      pass: "POST /api/rooms/:roomId/actions/pass { playerIndex, playerId }",
      yell: "POST /api/rooms/:roomId/actions/yell { playerIndex }",
      websocket: "/ws?roomId=<id>&playerId=<optional>",
    },
    frontend: "Use http://localhost:3000 for the web client by default.",
  });
});

function broadcastRoom(roomId) {
  const room = rooms.get(roomId);
  const clients = roomSockets.get(roomId) || new Set();
  const payload = JSON.stringify({
    type: "room:update",
    room: sanitizeRoom(room),
  });
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}

function sanitizeRoom(room) {
  if (!room) return null;
  return {
    ...room,
    players: room.players.map((player) => ({
      id: player.id,
      name: player.name,
      admin: player.admin,
      cards: player.cards,
    })),
  };
}

function ensureRoom(roomId) {
  const room = rooms.get(roomId);
  if (!room) {
    const err = new Error("Room not found");
    err.status = 404;
    throw err;
  }
  return room;
}

function assertPlayerCount(room) {
  if (room.players.length >= MAX_PLAYERS) {
    const err = new Error("Room is full");
    err.status = 400;
    throw err;
  }
}

function generateRoomCode() {
  let code;
  do {
    code = String(Math.floor(Math.random() * 900000) + 100000);
  } while (rooms.has(code));
  return code;
}

function resetDeck(room) {
  room.usedCards = {};
}

function startGame(room, playerId) {
  const admin = room.players.find((p) => p.id === playerId && p.admin);
  if (!admin) {
    const err = new Error("Only the admin can start the game");
    err.status = 403;
    throw err;
  }
  if (room.players.length < MIN_PLAYERS) {
    const err = new Error("Need at least two players to start");
    err.status = 400;
    throw err;
  }
  resetDeck(room);
  const usedCards = room.usedCards;
  let firstCard = takeACard(usedCards);
  while (isWild(firstCard)) {
    resetDeck(room);
    firstCard = takeACard(usedCards);
  }
  let drawCount = isDrawTwo(firstCard) ? 2 : 0;

  room.players = room.players.map((player) => {
    const cards = [];
    for (let i = 0; i < 7; i++) {
      cards.push(takeACard(usedCards));
    }
    return { ...player, cards };
  });

  room.playing = true;
  room.discardPile = firstCard;
  room.discardColor = null;
  room.currentMove = 0;
  room.isReverse = false;
  room.drawPile = false;
  room.drawCount = drawCount;
  room.yellOne = null;
  room.pennalty = null;
}

function advancePlayerIndex(room, moves = 1) {
  const totalPlayers = room.players.length;
  const direction = room.isReverse ? -1 : 1;
  const nextPlayer =
    (totalPlayers + (room.currentMove + moves * direction)) % totalPlayers;
  return nextPlayer;
}

function applyPenaltyCards(room, playerIndex, total) {
  const usedCards = room.usedCards;
  const playingCards = getPlayingCards(room);
  for (let i = 0; i < total; i++) {
    const newCard = takeACard(usedCards, playingCards);
    room.players[playerIndex].cards.push(newCard);
    playingCards.push(newCard);
  }
}

app.post("/api/rooms", (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      const err = new Error("Missing name");
      err.status = 400;
      throw err;
    }

    const roomId = generateRoomCode();
    const playerId = uuid();
    const room = {
      id: roomId,
      count: MAX_PLAYERS,
      playing: false,
      players: [
        {
          id: playerId,
          name,
          admin: true,
          cards: [],
        },
      ],
      discardPile: null,
      discardColor: null,
      currentMove: 0,
      isReverse: false,
      drawPile: false,
      drawCount: 0,
      yellOne: null,
      pennalty: null,
      usedCards: {},
    };
    rooms.set(roomId, room);
    res.json({ roomId, playerId });
  } catch (err) {
    next(err);
  }
});

app.post("/api/rooms/:roomId/players", (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { name } = req.body;
    const room = ensureRoom(roomId);
    if (!name) {
      const err = new Error("Missing name");
      err.status = 400;
      throw err;
    }
    if (room.playing) {
      const err = new Error("Game already started");
      err.status = 400;
      throw err;
    }
    assertPlayerCount(room);
    const playerId = uuid();
    room.players.push({
      id: playerId,
      name,
      admin: false,
      cards: [],
    });
    broadcastRoom(roomId);
    res.json({ playerId });
  } catch (err) {
    next(err);
  }
});

app.get("/api/rooms/:roomId", (req, res, next) => {
  try {
    const { roomId } = req.params;
    const room = ensureRoom(roomId);
    res.json({ room: sanitizeRoom(room) });
  } catch (err) {
    next(err);
  }
});

app.post("/api/rooms/:roomId/start", (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { playerId } = req.body;
    const room = ensureRoom(roomId);
    startGame(room, playerId);
    broadcastRoom(roomId);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.post("/api/rooms/:roomId/actions/draw", (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { playerId } = req.body;
    const room = ensureRoom(roomId);
    const playerIndex = room.players.findIndex((p) => p.id === playerId);
    if (playerIndex !== room.currentMove) {
      const err = new Error("Not your turn");
      err.status = 403;
      throw err;
    }
    const usedCards = room.usedCards;
    const playingCards = getPlayingCards(room);
    let drawCount = room.drawCount;
    const pennalty = room.pennalty;
    let total = drawCount || 0;
    if (pennalty) {
      total += pennalty;
    }
    if (drawCount > 0 || pennalty) {
      applyPenaltyCards(room, playerIndex, total);
      room.currentMove = advancePlayerIndex(room, 1);
      room.drawCount = 0;
      room.drawPile = false;
      room.pennalty = null;
    } else {
      const card = takeACard(usedCards, playingCards);
      room.players[playerIndex].cards.push(card);
      playingCards.push(card);
      room.drawPile = true;
      room.pennalty = null;
    }
    room.yellOne = null;
    room.usedCards = usedCards;
    broadcastRoom(roomId);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.post("/api/rooms/:roomId/actions/pass", (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { playerIndex, playerId } = req.body;
    const room = ensureRoom(roomId);
    if (room.currentMove !== playerIndex || room.players[playerIndex].id !== playerId) {
      const err = new Error("Not your turn");
      err.status = 403;
      throw err;
    }
    const playingCards = getPlayingCards(room);
    const usedCards = room.usedCards;
    const playerCards = room.players[playerIndex].cards;

    if (room.pennalty > 0) {
      applyPenaltyCards(room, playerIndex, room.pennalty);
    }

    room.players[playerIndex].cards = playerCards;
    room.currentMove = advancePlayerIndex(room, 1);
    room.usedCards = usedCards;
    room.previousMove = playerIndex;
    room.yellOne = null;
    room.drawCount = 0;
    room.drawPile = false;
    room.pennalty = null;

    broadcastRoom(roomId);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.post("/api/rooms/:roomId/actions/discard", (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { playerId, card, color } = req.body;
    const room = ensureRoom(roomId);
    const playerIndex = room.players.findIndex((p) => p.id === playerId);
    if (playerIndex !== room.currentMove) {
      const err = new Error("Not your turn");
      err.status = 403;
      throw err;
    }
    const playerCards = room.players[playerIndex].cards;
    if (!playerCards.includes(card)) {
      const err = new Error("Player does not have this card");
      err.status = 400;
      throw err;
    }
    const playerHadSingleCard = playerCards.length === 1;
    const valid = isAllowedToThrow(
      card,
      room.discardPile,
      room.discardColor,
      room.drawCount,
      playerCards
    );
    if (!valid) {
      const err = new Error("Card not allowed");
      err.status = 400;
      throw err;
    }

    const moves = room.players.length === 2 && isReverse(card) ? 2 : isSkip(card) ? 2 : 1;
    room.isReverse = room.players.length === 2 && isReverse(card) ? room.isReverse : isReverse(card) ? !room.isReverse : room.isReverse;
    const nextPlayer = advancePlayerIndex(room, moves);
    let drawCount = room.drawCount || 0;
    if (isWildDrawFour(card)) {
      drawCount += 4;
    } else if (isDrawTwo(card)) {
      drawCount += 2;
    }
    const remainingCards = playerCards.filter((c) => c !== card);
    let yellOne = verifyYellPlayer(room);
    let pennalty = room.pennalty || 0;
    const playingCards = getPlayingCards(room);
    if (yellOne == null) {
      if (remainingCards.length === 1 || playerHadSingleCard) {
        pennalty += 2;
      }
    }
    room.players[playerIndex].cards = remainingCards;
    if (pennalty > 0) {
      applyPenaltyCards(room, playerIndex, pennalty);
    }
    room.currentMove = nextPlayer;
    room.previousMove = playerIndex;
    room.discardPile = card;
    room.discardColor = color || null;
    room.drawCount = drawCount;
    room.drawPile = false;
    room.yellOne = yellOne;
    room.pennalty = null;
    room.usedCards = room.usedCards;
    room.playing = true;
    broadcastRoom(roomId);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.post("/api/rooms/:roomId/actions/yell", (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { playerIndex } = req.body;
    const room = ensureRoom(roomId);
    const playerCards = room.players[room.currentMove].cards;
    let pennalty = null;
    if (playerCards.length > 2) {
      pennalty = 4;
    }
    room.yellOne = playerIndex;
    room.pennalty = pennalty;
    broadcastRoom(roomId);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Server error" });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: "/ws" });

wss.on("connection", (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const roomId = url.searchParams.get("roomId");
  if (!roomId || !rooms.has(roomId)) {
    ws.close();
    return;
  }
  const roomClientSet = roomSockets.get(roomId) || new Set();
  roomClientSet.add(ws);
  roomSockets.set(roomId, roomClientSet);

  ws.send(
    JSON.stringify({
      type: "room:update",
      room: sanitizeRoom(rooms.get(roomId)),
    })
  );

  ws.on("close", () => {
    roomClientSet.delete(ws);
    roomSockets.set(roomId, roomClientSet);
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});
