import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useSession } from "next-auth/react"
import LoadingPage from "../Components/LoadingPage"
import {api, Url} from "../utils/ApiClient";
import {Button, Card, Carousel} from "react-bootstrap";
import osocEmblem from '../public/assets/osoc-screen.png';

function Home({ current_edition, students_length, projects_length }) {
  const { data: session, status } = useSession({ required: true })
  const isUser = session?.user

  console.log("cool")
  console.log(current_edition);

  const INTERVAL = 3000;

  if (isUser) {
    return (
        <>
          <Card style={{ width: "100%", height: "auto", margin: "auto" }}>
            <Card.Header>
              <h3 style={{ marginLeft: "10%"}}>Welcome back</h3>
            </Card.Header>

            <Carousel >

              <Carousel.Item interval={INTERVAL}>
                <Card.Body>
                  <Card.Title style={{ marginLeft: "10%"}}><h1>{current_edition.name}</h1></Card.Title>
                </Card.Body>
              </Carousel.Item>

              <Carousel.Item interval={INTERVAL}>
                <Card.Body>
                  <Card.Title style={{ marginLeft: "10%"}}><h1>{projects_length} Projects</h1></Card.Title>
                </Card.Body>
              </Carousel.Item>

              <Carousel.Item interval={INTERVAL}>
                <Card.Body>
                  <Card.Title style={{ marginLeft: "10%"}}><h1>{students_length} Students</h1></Card.Title>
                </Card.Body>
              </Carousel.Item>

            </Carousel>
          </Card>

    </>
    )

  }

  // Session is being fetched, or no user.
  // If no user, useEffect() will redirect.
  return <LoadingPage />
}

export default Home

export async function getServerSideProps(context) {
  console.log("A")
  let props_out = {}

  const current_edition =  await Url.fromName(api.current_edition).get(context)
  console.log("B")
  if (current_edition.success) {
    props_out["current_edition"] = current_edition.data;
  }

  const students = await Url.fromName(api.students).get(context)
  console.log("C")
  if (students.success) {
    props_out["students_length"] = students.data.length;
  }

  const projects = await Url.fromName(api.projects).get(context)
  console.log("D")
  if (projects.success) {
    props_out["projects_length"] = projects.data.length;
  }

  return {
    props: props_out
  }
}