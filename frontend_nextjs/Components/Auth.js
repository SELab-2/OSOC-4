import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useContext, useState } from "react";
import LoadingPage from "../Components/LoadingPage"
import NavHeader from "../Components/NavHeader"
import { Container } from "react-bootstrap";
import { cache } from "../utils/ApiClient";


export const WebsocketContext = React.createContext(undefined)

export default function RouteGuard(props) {
    const router = useRouter()
    const { data: session, status, token } = useSession()
    const isUser = !!session?.user && session?.error !== "RefreshAccessTokenError"
    const ws = useContext(WebsocketContext);
    const [creatingConnection, setCreatingConnection] = useState(false)
    const [webconn, setWebconn] = useState(undefined)

    useEffect(() => {
        if (status === 'loading') return // Do nothing while loading
        if (props.auth && !isUser) {
            router.push('/login') //Redirect to login
        } else if (isUser && props.auth && !ws && !creatingConnection) {
            // make a websocket connection    
            setCreatingConnection(true)
            let newwebconn = new WebSocket((process.env.NEXT_API_URL + "/ws").replace("http", "ws").replace("https", "ws"))
            newwebconn.addEventListener("message", (event) => {
                cache.updateCache(event.data, session["userid"])
            })
            newwebconn.onopen = (event) => {
                setCreatingConnection(false)
                setWebconn(newwebconn);
            }

        }

    }, [isUser, status, props.auth, router])

    if (isUser) {
        if (!props.auth) {
            router.push('/')
        } else {

            return (
                <WebsocketContext.Provider value={webconn}>
                    <Container fluid>
                        <NavHeader key="Navbar" className="navheader" />
                        {props.children}
                    </Container>
                </WebsocketContext.Provider>
            )
        }
    } else if (!props.auth && !isUser) {
        return props.children
    }
    // Session is being fetched, or no user.
    // If no user, useEffect() will redirect.
    return <LoadingPage />
}