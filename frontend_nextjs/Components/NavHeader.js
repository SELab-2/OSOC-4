import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { logout } from "../utils/json-requests";
import Link from 'next/link'

export default function NavHeader(props) {

    async function logoutHandler(event) {
        event.preventDefault();
        let r = await logout("/logout")
        if (r.success) {
            props.setLoggedInAs(null)
        }
    }

    return (
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
            <Container>
                <Navbar.Brand>
                    <img
                        src={process.env.PUBLIC_URL + "/assets/osoc-emblem.svg"}
                        width="50"
                        height="50"
                        className="d-inline-block align-top"
                        alt="React Bootstrap logo"
                    />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                        <Link href="/select-users">Select Users</Link>
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
            </Container>
        </Navbar>
    )
}
