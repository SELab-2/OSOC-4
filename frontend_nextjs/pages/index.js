import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useSession } from "next-auth/react"
import LoadingPage from "../Components/LoadingPage"

function Home(props) {

  const { data: session, status } = useSession({ required: true })
  const isUser = session?.user

  if (isUser) {
    return (<h1>COOL DASHBOARD</h1>)
  }

  // Session is being fetched, or no user.
  // If no user, useEffect() will redirect.
  return <LoadingPage />
}

export default Home