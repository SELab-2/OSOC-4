import {Navbar, Row, Col, Nav, Button, Container} from 'react-bootstrap';
import { signOut } from 'next-auth/react';
import Image from 'next/image'
import osocEmblem from '../public/assets/osoc-emblem.svg';
import Link from 'next/link'
import {useEffect, useState} from "react";
import {api, Url} from "../utils/ApiClient";

export default function NavHeader(props) {

    async function logoutHandler(event) {
        event.preventDefault();
        await signOut()
    }

    const [role, setRole] = useState(0)


    useEffect(() => {
        if (role === 0 ) {
            Url.fromName(api.me).get().then(res => {
                if (res.success) {
                    res = res.data.data;
                    setRole(res.role);
                }
            })
        }
    }, [role]);

    return (
      <Row className="navheader">
        <Navbar collapseOnSelect className="navbar navbar-expand-lg navbar-light">
          <Navbar.Brand href="/">
            <Image className="d-inline-block align-top" src={osocEmblem} alt="osoc-logo" width="90px" height="50px" objectFit={'contain'} />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <Link href="/select-students">Select Students</Link>
            </Nav>
              {(role === 2)?
                  <Nav className="me-auto">
                      <Link href="/email-students">Email Students</Link>
                  </Nav>
                  : null }
            <Nav className="me-auto">
              <Link href="/projects">Projects</Link>
            </Nav>
            <Nav className="me-auto">
              <Link href="/settings">Settings</Link>
            </Nav>
            <Nav>
              <Nav.Link onClick={logoutHandler}>Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </Row>
    )
}
