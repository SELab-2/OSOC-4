import 'bootstrap/dist/css/bootstrap.css'
import '../styles/globals.css'
import "../styles/colors.css"
import "../styles/login.css"
import "../styles/settings.css"
import "../styles/settingcards.css"
import "../styles/manageusers.css"
import "../styles/studentListelement.css"
import "../styles/select-students.css"
import "../styles/filters.css"
import "../styles/navheader.css"
import "../styles/studentDetails.css"
import "../styles/emailStudents.css"

import { SessionProvider } from 'next-auth/react';
import { useState } from 'react';
import RefreshTokenHandler from '../Components/refreshTokenHandler';
import Login from "../pages/login";
import RouteGuard from "../Components/Auth";
import Invite from "./invites/[invitekey]";
import Reset from "./resetpassword/[resetkey]";

function MyApp({ Component, pageProps }) {
  const [interval, setInterval] = useState(0);

  const no_auth = [Login, Invite, Reset];


  return (
    <SessionProvider session={pageProps.session} refetchInterval={interval} basePath={`${process.env.NEXT_BASE_PATH}/api/auth`}>

      <RouteGuard auth={!no_auth.includes(Component)}>
        <Component {...pageProps} />
        <RefreshTokenHandler setInterval={setInterval} />
      </RouteGuard>


    </SessionProvider >
  )
}

export default MyApp;
