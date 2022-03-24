import axios from 'axios';
import NextAuth from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import { getSession, getCsrfToken } from 'next-auth/react';
import { login } from '../../../utils/json-requests';

async function refreshAccessToken(tokenObject) {
    const csrfToken = await getCsrfToken()
    try {
        console.log("sending refresh request")
        // Get a new set of tokens with a refreshToken

        axios.defaults.baseURL = process.env.NEXT_API_URL || "http://localhost:8000";

        const tokenResponse = await axios.post("/refresh", {}, { headers: { "Authorization": "Bearer " + tokenObject.refreshToken, 'X-CSRF-TOKEN': csrfToken } });

        return {
            ...tokenObject,
            accessToken: tokenResponse.data.accessToken,
            accessTokenExpires: Date.now() + tokenResponse.data.accessTokenExpiry * 1000,
            refreshToken: tokenObject.refreshToken
        }
    } catch (error) {
        return {
            ...tokenObject,
            error: "RefreshAccessTokenError",
        }
    }
}

const providers = [
    CredentialsProvider({
        name: 'Credentials',
        authorize: async (credentials) => {
            try {
                // Authenticate user with credentials
                const user = await login({ "email": credentials.email, "password": credentials.password });

                console.log("muttn")
                console.log(user)

                user.data = user.data.data

                if (user.data["accessToken"]) {
                    return user.data;
                }
                return null;
            } catch (e) {
                console.log(e);
                throw new Error(e);
            }
        }
    })
]

const callbacks = {
    jwt: async ({ token, user }) => {
        if (user) {
            // This will only be executed at login. Each next invocation will skip this part.
            token.accessToken = user["accessToken"];
            token.accessTokenExpires = Date.now() + user["accessTokenExpiry"] * 1000;
            token.refreshToken = user["refreshToken"];
            token.userid = user["id"]
        }

        // If accessTokenExpires is 24 hours, we have to refresh token before 24 hours pass.
        const shouldRefreshTime = Math.round((token.accessTokenExpires - 60 * 60 * 1000) - Date.now());

        // If the token is still valid, just return it.
        if (Date.now() < token.accessTokenExpires) {
            return Promise.resolve(token);
        }

        // If the call arrives after 23 hours have passed, we allow to refresh the token.
        token = refreshAccessToken(token);
        return Promise.resolve(token);
    },
    session: async ({ session, token }) => {
        // Here we pass accessToken to the client to be used in authentication with your API
        session.accessToken = token.accessToken;
        session.accessTokenExpires = token.accessTokenExpires;
        session.error = token.error;
        session.userid = token.userid

        return Promise.resolve(session);
    },
}

export const options = {
    providers,
    callbacks,
    pages: {
        signIn: '/login',
    },
    secret: 'e8ae5c5d5cd7f0f1bec2303ad04a7c80f09f759d480a7a5faff5a6bbaa4078d0',
    debug: true
}

const Auth = (req, res) => NextAuth(req, res, options)
export default Auth;