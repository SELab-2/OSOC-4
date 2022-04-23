import { useSession } from "next-auth/react"
import LoadingPage from "../Components/LoadingPage"
import {api, Url} from "../utils/ApiClient";
import {Card, Carousel} from "react-bootstrap";

function Home({ current_edition, students_length, projects_length }) {
  const { data: session } = useSession({ required: true })
  const isUser = session?.user

  const INTERVAL = 3000;

  if (isUser) {
    return (
        <>
          <Card style={{ width: "100%", height: "auto", margin: "auto" }}>
            <Card.Header>
              <h3 className={"index-header"}>Welcome back</h3>
            </Card.Header>

            {(current_edition)?
            <Carousel >

              <Carousel.Item interval={INTERVAL}>
                <Card.Body>
                  <Card.Title className={"index-card-title"}><h1>{current_edition}</h1></Card.Title>
                </Card.Body>
              </Carousel.Item>

              <Carousel.Item interval={INTERVAL}>
                <Card.Body>
                  <Card.Title className={"index-card-title"}><h1>{projects_length} Projects</h1></Card.Title>
                </Card.Body>
              </Carousel.Item>

              <Carousel.Item interval={INTERVAL}>
                <Card.Body>
                  <Card.Title className={"index-card-title"}><h1>{students_length} Students</h1></Card.Title>
                </Card.Body>
              </Carousel.Item>

            </Carousel>
                :null}

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
  let props_out = {}

  const current_edition =  await Url.fromName(api.current_edition).get(context)
  if (current_edition.success) {
    props_out["current_edition"] = current_edition.data.name;
  }

  const students = await Url.fromName(api.editions_students).get(context)
  if (students.success) {
    props_out["students_length"] = students.data.length;
  }

  const projects = await Url.fromName(api.edition_projects).get(context)
  if (projects.success) {
    props_out["projects_length"] = projects.data.length;
  }

  return {
    props: props_out
  }
}