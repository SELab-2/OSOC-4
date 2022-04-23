import { useSession } from "next-auth/react"
import LoadingPage from "../Components/LoadingPage"
import {api, Url} from "../utils/ApiClient";
import {Button, Card, Carousel, Table} from "react-bootstrap";
import Message from "../Components/dashboard/Message";
import React, {useState} from "react";

function Home({ current_edition, students_length, projects_length, messages }) {
    const { data: session } = useSession({ required: true })
    const isUser = session?.user
    const [newUsers, setNewUsers] = useState(messages.newUsers);


    const INTERVAL = 3000;

    function showMessages() {
        if (newUsers.length) {
            return [(<h1 key="newly-joined-users-title">Newly joined users:</h1>), ...newUsers.map((user) => {
                async function approveUser() {
                    const res = await Url.fromName(api.users).extend("/" + user.id + "/approve").post()
                    if (res.success) {
                        setNewUsers(prevState => {return [...prevState.filter(u => u.id === user.id)]})
                    }
                }

                async function deleteUser() {
                    const res = await Url.fromName(api.users).extend("/" + user.id).delete();
                    if (res.success) {
                        setNewUsers(prevState => {return [...prevState.filter(u => u.id !== user.id)]})
                    }
                }

                return (<Message key={user.id} title={`${user.name} has joined`}
                                 subtitle="You can now approve or revoke the access to the application">
                    <h4>{user.name}</h4>
                    <h4>{user.email}</h4>
                    <Button className="user-button-unapproved" onClick={approveUser}>Approve user</Button>
                    <Button className="user-button-remove" onClick={deleteUser}>Revoke access</Button>
                </Message>)
                // <Table><tbody><UserTr isMe={false} key={msg.data.id} user={msg.data} /></tbody></Table>
            })]
        }
    }

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

                <hr/>

                {showMessages()}


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
    const current_edition =  await Url.fromName(api.current_edition).get(context);
    if (current_edition.success) {
        props_out["current_edition"] = current_edition.data.name;
    }

    const students = await Url.fromName(api.editions_students).get(context);
    if (students.success) {
        props_out["students_length"] = students.data.length;
    }

    const projects = await Url.fromName(api.edition_projects).get(context);
    if (projects.success) {
        props_out["projects_length"] = projects.data.length;
    }

    const users = await Url.fromName(api.users).get(context);
    if (users.success) {
        let usersData = await Promise.all(users.data.map(userData => Url.fromUrl(userData.id).get(context)));
        usersData = usersData.filter(resp => resp.success).map(d => d.data.data)
            .filter(user => user.active && !user.approved);
        props_out["messages"] = {"newUsers": usersData};
    }

    return {
        props: props_out
    }
}