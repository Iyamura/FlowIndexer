import { WebSocketServer, WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";
import { WsEvent, WsEventType } from "@flow-indexer/shared";

const clients = new Map<WebSocket, Set<WsEventType>>();

export function setupWebSocket(wss: WebSocketServer, _prisma: PrismaClient): void {
  wss.on("connection", (ws, req) => {
    const subscriptions = new Set<WsEventType>();
    clients.set(ws, subscriptions);

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "subscribe" && Array.isArray(msg.events)) {
          msg.events.forEach((e: WsEventType) => subscriptions.add(e));
          ws.send(JSON.stringify({ type: "subscribed", events: [...subscriptions] }));
        } else if (msg.type === "unsubscribe" && Array.isArray(msg.events)) {
          msg.events.forEach((e: WsEventType) => subscriptions.delete(e));
        } else if (msg.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
        }
      } catch {
        // ignore malformed
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
    });

    ws.send(JSON.stringify({ type: "connected", message: "FlowIndexer WebSocket ready" }));
  });
}

export function broadcast<T>(event: WsEvent<T>): void {
  const payload = JSON.stringify(event);
  for (const [ws, subscriptions] of clients.entries()) {
    if (ws.readyState === WebSocket.OPEN && subscriptions.has(event.type)) {
      ws.send(payload);
    }
  }
}

export function broadcastAll<T>(event: WsEvent<T>): void {
  const payload = JSON.stringify(event);
  for (const [ws] of clients.entries()) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}
