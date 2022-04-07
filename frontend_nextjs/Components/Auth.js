import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import LoadingPage from "../Components/LoadingPage"
import NavHeader from "../Components/NavHeader"
import {Container, Row} from "react-bootstrap";

export default function RouteGuard(props) {
    const router = useRouter()
    const { data: session, status, token } = useSession()
    const isUser = !!session?.user && session?.error !== "RefreshAccessTokenError"

    useEffect(() => {
        if (status === 'loading') return // Do nothing while loading
        if (props.auth && !isUser) router.push('/login') //Redirect to login

    }, [isUser, status, props.auth, router])

    if (isUser) {
        if (!props.auth) {
            router.push('/')
        } else {
            return (
                <Container>
                    <NavHeader key="Navbar" className="navheader" />
                    {props.children}
                </Container>
            )
        }
    } else if (!props.auth && !isUser) {
        return props.children
    }
    // Session is being fetched, or no user.
    // If no user, useEffect() will redirect.
    return <LoadingPage />
}