import {useSession} from "next-auth/react"
import LoadingPage from "../Components/LoadingPage"
import {api, Url} from "../utils/ApiClient";
import {Button, Card, Carousel, Col, Row} from "react-bootstrap";
import Message from "../Components/dashboard/Message";
import React, {useEffect, useState} from "react";

/**
 * The page corresponding with the 'index' (dashboard) of the application,
 *  the params are filled in by nextjs from the function defined below (getServerSideProps)
 * @returns {JSX.Element}
 */
function Home() {
    const {data: session} = useSession({required: true})
    const isUser = session?.user

    const [loading, setLoading] = useState(true);

    const [currentEdition, setCurrentEdition] = useState(undefined);
    const [studentsLength, setStudentsLength] = useState(undefined);
    const [projectsLength, setProjectsLength] = useState(undefined);
    const [newUsers, setNewUsers] = useState(undefined);

    useEffect(() => {
        async function fetch() {
            await Url.fromName(api.current_edition).get().then(res => {
                if (res.success) {
                    setCurrentEdition(res.data.name);
                }
            });
            await Url.fromName(api.editions_students).get().then(res => {
                if (res.success) {
                    setStudentsLength(res.data.length);
                }
            });
            await Url.fromName(api.edition_projects).get().then(res => {
                if (res.success) {
                    setProjectsLength(res.data.length);
                }
            });
            const users = await Url.fromName(api.users).get();
            if (users.success) {
                let usersData = await Promise.all(users.data.map(userData => Url.fromUrl(userData.id).get()));
                usersData = usersData.filter(resp => resp.success).map(d => d.data.data)
                    .filter(user => user.active && !user.approved);
                setNewUsers(usersData);
            }
            setLoading(false);
        }

        fetch();
    }, []);

    const INTERVAL = 3000;

    /**
     * returns a list of Elements which are the messages rendered
     * @returns {unknown[]}
     */
    function showNewUsers() {
        if (newUsers && newUsers.length) {
            return [(<h1 key="newly-joined-users-title">Newly joined users:</h1>), ...newUsers.map((user) => {
                async function approveUser() {
                    const res = await Url.fromName(api.users).extend("/" + user.id + "/approve").post()
                    if (res.success) {
                        setNewUsers(prevState => {
                            return [...prevState.filter(u => u.id === user.id)]
                        })
                    }
                }

                async function deleteUser() {
                    const res = await Url.fromName(api.users).extend("/" + user.id).delete();
                    if (res.success) {
                        setNewUsers(prevState => {
                            return [...prevState.filter(u => u.id !== user.id)]
                        })
                    }
                }

                return (
                    <Message key={user.id} title={`${user.name} has joined`}
                             subtitle="You can now approve or revoke the access to the application">
                        <h4>{user.name}</h4>
                        <h4>{user.email}</h4>
                        <Row>
                            <Button className="approve-btn" onClick={approveUser}>Approve user</Button>
                            <Button className="remove-btn" onClick={deleteUser}>Revoke access</Button>
                        </Row>
                    </Message>)
            })];
        }
    }

    if (loading) {
        return (<LoadingPage/>);
    }

    if (isUser) {
        return (
            <>
                <Col>
                    <Row>
                        <h1 className={"index-header"}>Welcome back</h1>
                    </Row>
                    {(currentEdition) ?
                        <Row>
                            <Carousel>
                                <Carousel.Item interval={INTERVAL}>
                                    <Card.Body>
                                        <Card.Title className={"index-card-title"}><h1>{currentEdition}</h1>
                                        </Card.Title>
                                    </Card.Body>
                                </Carousel.Item>

                                <Carousel.Item interval={INTERVAL}>
                                    <Card.Body>
                                        <Card.Title className={"index-card-title"}><h1>{projectsLength} Projects</h1>
                                        </Card.Title>
                                    </Card.Body>
                                </Carousel.Item>

                                <Carousel.Item interval={INTERVAL}>
                                    <Card.Body>
                                        <Card.Title className={"index-card-title"}><h1>{studentsLength} Students</h1>
                                        </Card.Title>
                                    </Card.Body>
                                </Carousel.Item>
                            </Carousel>
                        </Row>
                        : null}
                </Col>

                <hr/>

                <Row>
                    <Col className={"news-col"}>
                        {showNewUsers()}
                    </Col>
                </Row>

            </>
        )
    }

    // Session is being fetched, or no user.
    // If no user, useEffect() will redirect.
    return <LoadingPage/>
}


export default Home