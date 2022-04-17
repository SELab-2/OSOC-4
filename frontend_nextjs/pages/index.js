import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useSession } from "next-auth/react"
import LoadingPage from "../Components/LoadingPage"
import {useEffect} from "react";
import {api, Url} from "../utils/ApiClient";

function Home({ current_edition, students_length, projects_length }) {
  const { data: session, status } = useSession({ required: true })
  const isUser = session?.user

  console.log("cool")
  console.log(current_edition);

  if (isUser) {
    return (
        <>
          <h1>{current_edition.name}</h1>
          <h5>There are {projects_length} projects, and {students_length} students!</h5>
        </>
    )

  }

  // Session is being fetched, or no user.
  // If no user, useEffect() will redirect.
  return <LoadingPage />
}

export default Home

export async function getServerSideProps(context) {
  const current_edition =  await Url.fromName(api.current_edition).get(context)
  let props_out = {}
  if (current_edition.success) {
    props_out["current_edition"] = current_edition.data;
  }

  const students = await Url.fromName(api.students).get(context)
  if (students.success) {
    props_out["students_length"] = students.data.length;
  }

  const projects = await Url.fromName(api.projects).get(context)
  if (projects.success) {
    props_out["projects_length"] = projects.data.length;
  }

  return {
    props: props_out
  }
}