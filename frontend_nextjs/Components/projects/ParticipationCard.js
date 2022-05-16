import { Card, Col, Row } from "react-bootstrap";
import SkillCard from "./SkillCard";
import { useEffect, useState } from "react";
import Image from 'next/image';
import red_cross from "/public/assets/wrong.svg";
import { api, Url } from "../../utils/ApiClient";
import { getID } from "../../utils/string";


/**
 * Card like representation of the given participation, which also allows the deletion of the participation
 * @param props participation the participation that the component shows
 * @returns {JSX.Element}
 * @constructor
 */
export default function ParticipationCard(props) {

    const [student, setStudent] = useState({})
    const [deletedCard, setDeletedCard] = useState(false);

    /**
     * Loads once after the component mounts, it sets the student state.
     */
    useEffect(() => {
        Url.fromUrl(props.participation.student).get().then(response => {
            if (response.success) {
                setStudent(response.data)
            }
        })
    }, [])

    /**
     * deletes props.participation
     */
    function deleteStudentFromProject() {
        // delete participation
        Url.fromName(api.participations)
            .setParams({ project_id: props.project.id_int, student_id: getID(props.participation.student) })
            .delete().then(res => {
                //TODO remove when using websockets
                if (res.success) {
                    setDeletedCard(true)
                }
            })
    }

    return (
        <div>
            {!deletedCard ?
                <Card className={"participation-card"} key={props.participation}>
                    <div className={"participation-div"}>
                        <Row>
                            <Col className={"participation-info"}>
                                <div className={"participation-name"}>
                                    {(Object.keys(student).length) ? (`${student["mandatory"]["first name"]} ${student["mandatory"]["last name"]}`) : null}
                                </div>
                                <SkillCard number={0} skill_name={props.participation.skill} />
                            </Col>
                            <Col xs={"auto"} className={"participation-remove-student"}>
                                <div className={"participation-delete"}>
                                    <Image alt={"delete student from project button"} onClick={deleteStudentFromProject} src={red_cross} width={25} height={25} />
                                </div>
                            </Col>
                        </Row>
                    </div>

                </Card> : null}
        </div>
    )
}