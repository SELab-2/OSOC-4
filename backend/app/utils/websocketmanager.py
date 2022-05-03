from typing import List

from fastapi import WebSocket


class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        print('new connection')
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send(message)

    async def broadcast(self, message: str):
        print(f"broadcasting to active connections '{self.active_connections}' ...")
        for conn in self.active_connections:
            await conn.send_json(message)
