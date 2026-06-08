"use client";

import { useEffect, useRef, useCallback } from "react";
import { WsEvent, WsEventType } from "@flow-indexer/shared";

type Handler<T = unknown> = (event: WsEvent<T>) => void;

export function useWebSocket(events: WsEventType[], handler: Handler) {
  const wsRef = useRef<WebSocket | null>(null);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const connect = useCallback(() => {
    const url = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000";
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "subscribe", events }));
    };

    ws.onmessage = (msg) => {
      try {
        const event = JSON.parse(msg.data) as WsEvent;
        handlerRef.current(event);
      } catch {}
    };

    ws.onclose = () => {
      setTimeout(connect, 3000);
    };
  }, [events]);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, [connect]);
}
