import { createContext, useContext } from 'react'
import React, { useEffect, useState } from "react";

const WebsocketContext = createContext(undefined)

export function WebsocketProvider(props) {
    const [websocketConn, setWebsocketConn] = useState(undefined)
    const { children } = props

    const handleWebsocket = websocket => {
        setWebsocketConn(websocket);
    }

    const contextProps = {
        websocketConn,
        handleWebsocket
    };

    return (
        <WebsocketContext.Provider value={contextProps}>
            {children}
        </WebsocketContext.Provider>
    )
}

export function useWebsocketContext() {
    return useContext(WebsocketContext);
}