import {Navbar, Nav, Container, OverlayTrigger, Button, Popover, Row} from 'react-bootstrap';
import {signOut} from 'next-auth/react';
import Image from 'next/image'
import osocEmblem from '../public/assets/osoc-emblem.svg';
import bell from '../public/assets/bell.svg'
import bellNotifications from '../public/assets/bell-notification.svg'
import {useEffect, useState} from "react";
import {api, Url} from "../utils/ApiClient";
import {useRouter} from "next/router";
import Message from './Message';

export default function NavHeader(props) {
    async function logoutHandler(event) {
        event.preventDefault();
        await signOut()
    }

    const [role, setRole] = useState(0);
    const [newUsers, setNewUsers] = useState(undefined);

    useEffect(() => {
        if (role === 0) {
            Url.fromName(api.me).get().then(res => {
                if (res.success) {
                    res = res.data.data;
                    setRole(res.role);
                }
            })
        }
        if (!newUsers) {
            Url.fromName(api.users).get().then(users => {
                if (users.success) {
                    Promise.all(users.data.map(userData => Url.fromUrl(userData.id).get())).then(usersData => {
                        let filtered = usersData.filter(resp => resp.success).map(d => d.data.data)
                        .filter(user => user.active && !user.approved);
                    setNewUsers(filtered);
                    });
                }
            });
        }
    }, [role]);

    /**
     * returns a list of Elements which are the messages rendered
     * @returns {unknown[]}
     */
     function showNewUsers() {
        if (newUsers && newUsers.length) {
            return [...newUsers.map(user => {
                
                async function approveUser() {
                    const res = await Url.fromName(api.users).extend("/" + user.id + "/approve").post()
                    if (res.success) {
                        setNewUsers(prevState => {
                            return [...prevState.filter(u => String(u.id) !== String(user.id))]
                        })
                    }
                }

                async function deleteUser() {
                    const res = await Url.fromName(api.users).extend("/" + user.id).delete();
                    if (res.success) {
                        setNewUsers(prevState => {
                            return [...prevState.filter(u => String(u.id) !== String(user.id))]
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


    const menu = [
        {title: 'Select Students', path: '/select-students'},
        {title: 'Projects', path: '/projects'},
        {title: 'Settings', path: '/settings'},
    ]
    const router = useRouter()

    const notificationsPopover = (<Popover id="popover-notifications">
      {showNewUsers()}
  </Popover>);

    return (
        <Navbar expand="md">
            <Container>
                <Image className="d-inline-block align-top" src={osocEmblem} alt="osoc-logo" width="90px"
                        height="50px" objectFit={'contain'}/>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                        {menu.map(item => {
                            return (
                                <Nav.Link href={item.path}
                                          className={
                                              router.pathname === item.path ? "active" : ""
                                          }>
                                    {item.title}
                                </Nav.Link>
                            )
                        })}
                        {(role === 2)? 
                            (newUsers && newUsers.length)?
                                <OverlayTrigger trigger="click" placement="bottom" overlay={notificationsPopover}>
                                <Button className='image-button' style={{marginTop: "5px"}}><Image src={bellNotifications}/></Button>
                                </OverlayTrigger> 
                            : <Button className='image-button' style={{marginTop: "5px"}}><Image src={bell}/></Button> 
                        : null}
                        <Nav.Link onClick={logoutHandler} id="logout-link">Log out</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}
