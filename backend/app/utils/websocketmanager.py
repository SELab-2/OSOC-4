""" This module includes the WebsocketManager class
"""

from typing import List

from fastapi import WebSocket


class WebSocketManager:
    """ WebsocketManager manages the websocket connections
    """
    def __init__(self):
        """__init__ Initialize the websocket manager with an empty connection array
        """
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """connect add a new websocket connection to the list of active connections

        :param websocket: new websocket connection
        :type websocket: WebSocket
        """
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        """disconnect remove a websocket connection from the list of active connections

        :param websocket: _description_
        :type websocket: WebSocket
        """
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        """send_personal_message send a message to a specific websocket connection

        :param message: message to be sent
        :type message: str
        :param websocket: the WebSocket connection
        :type websocket: WebSocket
        """
        await websocket.send(message)

    async def broadcast(self, message: str):
        """broadcast send a message to all active connections

        :param message: the message to be sent
        :type message: str
        """
        for conn in self.active_connections:
            await conn.send_json(message)
