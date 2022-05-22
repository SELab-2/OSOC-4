import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import LoadingPage from "../Components/LoadingPage"
import NavHeader from "../Components/NavHeader"
import { cache } from "../utils/ApiClient";
import { useWebsocketContext } from './WebsocketProvider'

/**
 * This component makes sure that only authorized users can access certain pages. It also redirects unauthorized users to login page.
 * @param props this includes all the children components and a boolean auth that represents if the page that must be shown is authorized or not.
*/
export default function RouteGuard(props) {
    const router = useRouter()
    const { data: session, status, token } = useSession()
    const isUser = !!session?.user && session?.error !== "RefreshAccessTokenError"
    const { websocketConn, handleWebsocket } = useWebsocketContext();
    const [creatingConnection, setCreatingConnection] = useState(false)

    useEffect(() => {
        if (status === 'loading') return // Do nothing while loading
        if (props.auth && !isUser) {
            router.push('/login') // Redirect to "login"-path
        } else if (isUser && props.auth && !websocketConn && !creatingConnection) {
            connect();
        }

    }, [router, isUser, props.auth, status, websocketConn])

    /**
     * Create a websocket connection + handle the states
     */
    function connect() {
        // make a websocket connection
        setCreatingConnection(true)
        let newwebconn = new WebSocket((process.env.NEXT_API_URL + "/ws").replace("http", "ws").replace("https", "ws"))

        // update the cache if a message is received (this is needed so the cache is up to date)
        newwebconn.addEventListener("message", (event) => {
            cache.updateCache(event.data, session["userid"])
        })
        newwebconn.onopen = (event) => {
            setCreatingConnection(false)
            handleWebsocket(newwebconn);
        }
        newwebconn.onclose = (event) => {
            console.log('Socket is closed. Reconnect will be attempted in 1 second.', event.reason);
            setTimeout(function () {
                connect();
            }, 1000);
        }
        newwebconn.onerror = (event) => {
            newwebconn.close();
        }
    }

    if (isUser) {
        if (!props.auth) {
            router.push('/')
        } else {

            return (
                <>
                    <NavHeader key="Navbar" className="navheader" />
                    {props.children}
                </>
            )
        }
    } else if (!props.auth && !isUser) {
        return props.children
    }
    // Session is being fetched, or no user.
    // If no user, useEffect() will redirect.
    return <LoadingPage />
}