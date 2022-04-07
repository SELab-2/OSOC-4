import {Navbar, Row, Col, Nav, Button, Container} from 'react-bootstrap';
import { signOut } from 'next-auth/react';
import Image from 'next/image'
import osocEmblem from '../public/assets/osoc-emblem.svg';
import Link from 'next/link'

export default function NavHeader(props) {

    async function logoutHandler(event) {
        event.preventDefault();
        signOut()
    }

    return (
      <Row className="navheader">
        <Navbar collapseOnSelect class="navbar navbar-expand-lg navbar-light bg-light">
          <Navbar.Brand href="/">
            <Image className="d-inline-block align-top" src={osocEmblem} alt="osoc-logo" width="90px" height="50px" objectFit={'contain'} />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <Link href="/select-students">Select Students</Link>
            </Nav>
            <Nav className="me-auto">
              <Link href="/email-users">Email Users</Link>
            </Nav>
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
