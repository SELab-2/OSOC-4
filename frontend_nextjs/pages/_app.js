import '../styles/globals.css'
import 'bootstrap/dist/css/bootstrap.css'
import "../styles/colors.css"
import "../styles/login.css"
import useSWR from 'swr';
import NavHeader from '../Components/NavHeader'
import { useRouter } from 'next/router';
import axios from 'axios'
import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../Components/ProtectedRoute';

axios.defaults.baseURL = process.env.PUBLIC_URL || "http://localhost:8000";
const fetcher = url => axios.get(url).then(res => res.data)

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const showHeader = router.pathname === '/login' ? false : true;

  return (
    <>
      <ProtectedRoute router={router} >
        {showHeader && <NavHeader />}
        < Component {...pageProps} />
      </ProtectedRoute>

    </>
  )

}

export default MyApp
