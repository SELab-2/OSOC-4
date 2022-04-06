import {Navbar, Row, Col, Nav, Button} from 'react-bootstrap';
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
        <Col md="auto">
          <Navbar.Brand href="/" className="logo_header">
            <Image className="d-inline-block align-top" src={osocEmblem} alt="osoc-logo" width="95px" height="50px" objectFit={'contain'} />
          </Navbar.Brand>
        </Col>
        <Col />

        <Col md="auto" className="navbar-item">
          <Link href="/select-students" className="fill_parent">Select students</Link>
        </Col>

        <Col md="auto" className="navbar-item">
          <Link href="/email-students" className="fill_parent">Email students</Link>
        </Col>

        <Col md="auto" className="navbar-item">
          <Link href="/projects" className="fill_parent">Projects</Link>
        </Col>

        <Col md="auto" className="navbar-item">
          <Link href="/settings" className="fill_parent">Settings</Link>
        </Col>

        <Col md="auto" className="navbar-item" onClick={logoutHandler}>
          Logout
        </Col>
      </Row>
    )
}
