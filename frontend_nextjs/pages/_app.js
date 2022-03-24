import '../styles/globals.css'
import 'bootstrap/dist/css/bootstrap.css'
import "../styles/colors.css"
import "../styles/login.css"
import "../styles/settings.css"
import "../styles/settingcards.css"
import "../styles/manageusers.css"

import { SessionProvider } from 'next-auth/react';
import { useState } from 'react';
import RefreshTokenHandler from '../Components/refreshTokenHandler';
import Login from "../pages/login";
import RouteGuard from "../Components/Auth";

function MyApp({ Component, pageProps }) {
  const [interval, setInterval] = useState(0);

  const no_auth = [Login];


  return (
    <SessionProvider session={pageProps.session} refetchInterval={interval} basePath={`/api/auth`}>

      <RouteGuard auth={!no_auth.includes(Component)}>
        <Component {...pageProps} />
        <RefreshTokenHandler setInterval={setInterval} />
      </RouteGuard>


    </SessionProvider >
  )
}

export default MyApp;
