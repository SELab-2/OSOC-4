import {Navbar, Nav, NavDropdown, Container, Col, Button} from 'react-bootstrap';
import { logout } from "../utils/json-requests";
import Link from 'next/link'
import { signOut } from 'next-auth/react';
import Image from 'next/image'
import osocEmblem from '../public/assets/osoc-emblem.svg';
import {router} from "next/client";

export default function NavHeader(props) {

    async function logoutHandler(event) {
        event.preventDefault();
        signOut()
    }

    return (
        <Navbar collapseOnSelect className="navheader">
            <Container>
                <Col>
                    <Navbar.Brand href="/">
                        <Image className="d-inline-block align-top" src={osocEmblem} alt="osoc-logo" width="65px" height="50px" objectFit={'contain'} />
                    </Navbar.Brand>
                </Col>
                <Col />

                <Col md="auto" className="navbar-item">
                    <p>Select Students</p>
                </Col>
                <Col md="auto" className="navbar-item">
                    <p>Email Users</p>
                </Col>
                <Col md="auto" className="navbar-item">
                    <p>Projects</p>
                </Col>
                <Col md="auto" className="navbar-item">
                    <p>Settings</p>
                </Col>
                <Col md="auto" className="navbar-item" onClick={logoutHandler}>
                    <p>Logout</p>
                </Col>

            </Container>
        </Navbar>
    )
}
