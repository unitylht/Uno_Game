const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

const wsBase = API_BASE_URL.replace(/^http/, "ws");

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message = errorBody.error || res.statusText;
    throw new Error(message);
  }
  return res.json();
}

export async function createRoom(name) {
  return request("/api/rooms", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function joinRoom(roomId, name) {
  return request(`/api/rooms/${roomId}/players`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function fetchRoom(roomId) {
  return request(`/api/rooms/${roomId}`);
}

export async function startRoomGame(roomId, playerId) {
  return request(`/api/rooms/${roomId}/start`, {
    method: "POST",
    body: JSON.stringify({ playerId }),
  });
}

export async function drawCard(roomId, playerId) {
  return request(`/api/rooms/${roomId}/actions/draw`, {
    method: "POST",
    body: JSON.stringify({ playerId }),
  });
}

export async function passTurn(roomId, playerIndex, playerId) {
  return request(`/api/rooms/${roomId}/actions/pass`, {
    method: "POST",
    body: JSON.stringify({ playerIndex, playerId }),
  });
}

export async function discardCard(roomId, playerId, card, color) {
  return request(`/api/rooms/${roomId}/actions/discard`, {
    method: "POST",
    body: JSON.stringify({ playerId, card, color }),
  });
}

export async function yellOne(roomId, playerIndex) {
  return request(`/api/rooms/${roomId}/actions/yell`, {
    method: "POST",
    body: JSON.stringify({ playerIndex }),
  });
}

export function connectToRoom(roomId, playerId) {
  const url = `${wsBase}/ws?roomId=${roomId}${
    playerId ? `&playerId=${playerId}` : ""
  }`;
  return new WebSocket(url);
}

export { API_BASE_URL };
