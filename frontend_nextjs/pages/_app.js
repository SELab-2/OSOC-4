import 'bootstrap/dist/css/bootstrap.css'
import '../styles/globals.css'
import "../styles/colors.css"
import "../styles/index.css"
import "../styles/login.css"
import "../styles/settings.css"
import "../styles/settingcards.css"
import "../styles/manageusers.css"
import "../styles/studentListelement.css"
import "../styles/students.css"
import "../styles/filters.css"
import "../styles/navheader.css"
import "../styles/studentDetails.css"
import "../styles/emailStudents.css"
import "../styles/projects.css"
import "../styles/projectDetails.css"
import "../styles/requiredSkillSelector.css"
import "../styles/defaultEmail.css"
import "../styles/addProject.css"

import { ThemeProvider } from "react-bootstrap";
import { SessionProvider } from 'next-auth/react';
import { useState } from 'react';
import RefreshTokenHandler from '../Components/refreshTokenHandler';
import Login from "../pages/login";
import RouteGuard from "../Components/Auth";
import Invite from "./invites/[invitekey]";
import Reset from "./resetpassword/[resetkey]";
import { WebsocketProvider } from "../Components/WebsocketProvider"

function MyApp({ Component, pageProps }) {
  const [interval, setInterval] = useState(0);

  const no_auth = [Login, Invite, Reset];


  return (
    <SessionProvider session={pageProps.session} refetchInterval={interval} basePath={`${process.env.NEXT_BASE_PATH}/api/auth`}>
      <WebsocketProvider>
        <RouteGuard auth={!no_auth.includes(Component)}>
          <ThemeProvider
            breakpoints={['xxxl', 'xxl', 'xl', 'lg', 'md', 'sm', 'xs', 'xxs']}
          >
            <Component {...pageProps} />
          </ThemeProvider>
          <RefreshTokenHandler setInterval={setInterval} />
        </RouteGuard>
      </WebsocketProvider>


    </SessionProvider >
  )
}

export default MyApp;
