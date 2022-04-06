import {Navbar, Col, Row} from 'react-bootstrap';
import { signOut } from 'next-auth/react';
import Image from 'next/image'
import osocEmblem from '../public/assets/osoc-emblem.svg';
import {router} from "next/client";

export default function NavHeader(props) {

    async function logoutHandler(event) {
        event.preventDefault();
        signOut()
    }

    function loadpage(path) {
        router.push(path)
    }

    return (
        <Row>
            <Col>
                <Navbar.Brand href="/">
                    <Image className="d-inline-block align-top" src={osocEmblem} alt="osoc-logo" width="65px" height="50px" objectFit={'contain'} />
                </Navbar.Brand>
            </Col>
            <Col />

            <Col md="auto" className="navbar-item" onClick={() => loadpage('/select-students')}>
                <p>Select Students</p>
            </Col>
            <Col md="auto" className="navbar-item" onClick={() => loadpage('/email-students')}>
                <p>Email students</p>
            </Col>
            <Col md="auto" className="navbar-item" onClick={() => loadpage('/projects')}>
                <p>Projects</p>
            </Col>
            <Col md="auto" className="navbar-item" onClick={() => loadpage('/settings')}>
                <p>Settings</p>
            </Col>
            <Col md="auto" className="navbar-item" onClick={logoutHandler}>
                <p>Logout</p>
            </Col>
        </Row>
    )
}
