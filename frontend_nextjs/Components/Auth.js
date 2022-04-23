import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useContext } from "react";
import LoadingPage from "../Components/LoadingPage"
import NavHeader from "../Components/NavHeader"
import { Container } from "react-bootstrap";


const WebsocketContext = React.createContext(undefined)

export default function RouteGuard(props) {
    const router = useRouter()
    const { data: session, status, token } = useSession()
    const isUser = !!session?.user && session?.error !== "RefreshAccessTokenError"
    const ws = useContext(WebsocketContext);

    useEffect(() => {
        if (status === 'loading') return // Do nothing while loading
        if (props.auth && !isUser) router.push('/login') //Redirect to login

    }, [isUser, status, props.auth, router])

    if (isUser) {
        if (!props.auth) {
            router.push('/')
        } else {

            // make a websocket connection            
            let webconn = ws;
            if (!webconn) {
                webconn = new WebSocket("ws://localhost:8000/ws")
            }

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