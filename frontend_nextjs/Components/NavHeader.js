import {Navbar, Nav, Container} from 'react-bootstrap';
import {signOut} from 'next-auth/react';
import Image from 'next/image'
import osocEmblem from '../public/assets/osoc-emblem.svg';
import {useEffect, useState} from "react";
import {api, Url} from "../utils/ApiClient";
import {useRouter} from "next/router";

export default function NavHeader(props) {
    async function logoutHandler(event) {
        event.preventDefault();
        await signOut()
    }

    const [role, setRole] = useState(0)

    useEffect(() => {
        if (role === 0) {
            Url.fromName(api.me).get().then(res => {
                if (res.success) {
                    res = res.data.data;
                    setRole(res.role);
                }
            })
        }
    }, [role]);


    const menu = [
        {title: 'Home', path: '/'},
        {title: 'Students', path: '/students'},
        {title: 'Projects', path: '/projects'},
        {title: 'Settings', path: '/settings'},
    ]
    const router = useRouter()

    return (
        <Navbar expand="md">
            <Container>
                <Navbar.Brand href="/">
                    <Image className="d-inline-block align-top" src={osocEmblem} alt="osoc-logo" width="90px"
                           height="50px" objectFit={'contain'}/>
                </Navbar.Brand>
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
                        <Nav.Link onClick={logoutHandler} id="logout-link">Log out</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}
