import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { logout } from "../utils/json-requests";
import {Link} from "react-router-dom";

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
                <Navbar.Brand href="#home">
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
                        <Link to="/select-users">Select Users</Link>
                    </Nav>
                    <Nav className="me-auto">
                        <Link to="/email-users">Email Users</Link>
                    </Nav>
                    <Nav className="me-auto">
                        <Link to="/projects">Projects</Link>
                    </Nav>
                    <Nav className="me-auto">
                        <Link to="/settings">Settings</Link>
                    </Nav>
                    <Nav>
                        <Nav.Link onClick={logoutHandler}>Logout</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}
