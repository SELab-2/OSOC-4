import {Form} from "react-bootstrap";
import React, {useState} from "react";


export default function NewProjects(props) {
    const [projectName, setProjectName] = useState()
    const [partnerName, setPartnerName] = useState()
    const [partnerBio, setPartnerBio] = useState()
    const [projectBio, setProjectBio] = useState()
    const [briefing, setBriefing] = useState()

    const [tools, setTools] = useState()
    const [codeLanguages, setCodeLanguages] = useState()


    return(
        <div>
            <h1>New project</h1>
            <Form>
                <Form.Label>Project name:</Form.Label>
                <Form.Control type="text" value={projectName} placeholder={"Project name"} onChange={e => setProjectName(e.target.value)} />

                <Form.Label>Partner name:</Form.Label>
                <Form.Control type="text" value={partnerName} placeholder={"Partner name"} onChange={e => setPartnerName(e.target.value)} />

                <Form.Label>About partner:</Form.Label>
                <Form.Control as="textarea" rows={3} value={partnerBio} placeholder={"Short bio about the partner, website, ..."} onChange={e => setPartnerBio(e.target.value)} />

                <Form.Label>About project:</Form.Label>
                <Form.Control as="textarea" rows={3} value={projectBio} placeholder={"Short explanation about the project, what it does, how it works, ..."} onChange={e => setProjectBio(e.target.value)} />

                <Form.Label>Briefing:</Form.Label>
                <Form.Control as="textarea" rows={3} value={briefing} placeholder={"Link to the project page"} onChange={e => setBriefing(e.target.value)} />

                <h3>Resources</h3>

                <Form.Label>Tooling:</Form.Label>
                <Form.Control type="text" value={tools} placeholder={"What tools will be used in the project"} onChange={e => setTools(e.target.value)} />

                <Form.Label>Code languages:</Form.Label>
                <Form.Control type="text" value={codeLanguages} placeholder={"What code languages will be used in the project"} onChange={e => setCodeLanguages(e.target.value)} />
                {/*TODO add student part*/}
            </Form>

        </div>
    )
}
