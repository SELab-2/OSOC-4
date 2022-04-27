import {Card, Col, Row} from "react-bootstrap";
import SkillCard from "./SkillCard";
import {useEffect, useState} from "react";
import Image from 'next/image'
import {api, Url} from "../../utils/ApiClient";
import red_cross from "/public/assets/wrong.svg"
import {log} from "../../utils/logger";
import {getID} from "../../utils/string";


// TODO add extra info on hover
export default function ParticipationCard(props){

    const [student, setStudent] = useState({});
    const [deletedCard, setDeletedCard] = useState(false);

    useEffect(() => {
        Url.fromUrl(props.participation.student).get().then(response => {
            if(response.success){
                setStudent(response.data)
            }
        })
    }, [])

    function deleteStudentFromProject(){
        // delete participation
        Url.fromName(api.participations)
            .setParams({project_id:getID(props.project.id), student_id:getID(props.participation.student)})
            .delete().then(res => {
                //TODO remove when using websockets
                if (res.success){
                    setDeletedCard(true)
                }
        })
    }

    return(
        <div>
            { (! deletedCard) ?
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
                                    <Image  alt={"delete student from project button"} onClick={() => deleteStudentFromProject()} src={red_cross} width={25} height={25}/>
                                </div>
                            </Col>
                        </Row>
                    </div>

                </Card>  : null}
    </div>
    )
}