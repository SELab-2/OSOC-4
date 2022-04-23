import {Button, Card, Col, Row} from "react-bootstrap";
import SkillCard from "./SkillCard";
import {useEffect, useState} from "react";
import Image from 'next/image'
import {Url} from "../../utils/ApiClient";
import red_cross from "/public/assets/wrong.svg"
import {log} from "../../utils/logger";


// TODO add extra info on hover
export default function ParticipationCard(props){

    const [student, setStudent] = useState({})

    useEffect(() => {
        Url.fromUrl(props.participation.student).get().then(response => {
            if(response.success){
                setStudent(response.data)
            }
        })
    }, [])

    function deleteStudentFromProject(){
        log("TEST")
        // delete participation
    }

    return(
        <Card className={"participation-card"} key={props.participation}>
            <div className={"participation-div"}>
                <Row>
                    <Col className={"participation-info"}>
                        <div className={"participation-name"}>
                            {(Object.keys(student).length) ? (`${student["mandatory"]["first name"]} ${student["mandatory"]["last name"]}`) : null }
                        </div>
                        <SkillCard amount={0} name={props.participation.skill}/>
                    </Col>
                    <Col xs={"auto"} className={"participation-remove-student"}>
                        <div className={"participation-delete"}>
                            <Image  alt={"delete student from project button"} onClick={deleteStudentFromProject} src={red_cross} width={25} height={25}/>
                        </div>
                    </Col>
                </Row>
            </div>

        </Card>
    )
}