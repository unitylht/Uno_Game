import { useEffect, useRef, useState } from "react";
import { connectToRoom, fetchRoom } from "~/utils/apiClient";

export default function useRoomSubscription(roomId, playerId) {
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!roomId) return;
      try {
        const { room: serverRoom } = await fetchRoom(roomId);
        if (!active) return;
        setRoom(serverRoom);
        setPlayers(serverRoom.players || []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return undefined;
    const ws = connectToRoom(roomId, playerId);
    socketRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "room:update") {
          setRoom(payload.room);
          setPlayers(payload.room?.players || []);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to parse message", err);
      }
    };

    return () => {
      ws.close();
    };
  }, [roomId, playerId]);

  return { room, players };
}
