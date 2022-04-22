import React from "react";
import {Button, Card, Col, Container, Form, Row} from "react-bootstrap";
import ProjectsList from "../Components/projects/ProjectsList";
import ProjectCard from "../Components/projects/ProjectCard";

export default function Projects() {

    return(
        <Row className="remaining_height fill_width">
            <Col className="fill_height">
                Students
            </Col>
            <Col className="fill_height">
                <ProjectsList/>
            </Col>
        </Row>
    // Url.fromName(api.edition_projects)
    )
}
