import { Card, Col, Row } from "react-bootstrap";
import SkillCard from "./SkillCard";
import { useEffect, useState } from "react";
import Image from 'next/image';
import red_cross from "/public/assets/wrong.svg";
import { api, Url } from "../../utils/ApiClient";
import { getID } from "../../utils/string";
import Hint from "../Hint";


/**
 * Card like representation of the given participation, which also allows the deletion of the participation
 * @param props participation the participation that the component shows
 * @returns {JSX.Element}
 * @constructor
 */
export default function ParticipationCard(props) {

    const [student, setStudent] = useState({})
    const [project, setProject] = useState({})
    const [reason, setReason] = useState(props.participation.reason || "No reason was given");

    /**
     * Loads once after the component mounts, it sets the student state.
     */
    useEffect(() => {
        if (props.project) {
            Url.fromUrl(props.participation.student).get().then(response => {
                if (response.success) {
                    setStudent(response.data);
                    console.log(response.data);
                }
            })
            setProject(props.project);

        } else {
            Url.fromUrl(props.participation.project).get().then(response => {
                if (response.success) {
                    setProject(response.data);
                }
            })
            setStudent(props.student);
        }
    }, [props.participation])

    /**
     * deletes props.participation
     */
    function deleteStudentFromProject(ev) {
        ev.stopPropagation();
        // delete participation
        Url.fromName(api.participations)
          .setParams({project_id: project.id_int, student_id: student.id_int})
          .delete().then();
     }

    return (
        <div>
            <Card className={"participation-card"} key={props.participation}>
                <div className={"participation-div"}>
                    <Row>
                        <Hint message={reason}>
                            <Col className={"participation-info"}>
                                <div className={"participation-name"}>
                                    { (props.project)?
                                      ((Object.keys(student).length) ? (`${student["mandatory"]["first name"]} ${student["mandatory"]["last name"]}`) : null)
                                      : project.name
                                    }
                                </div>
                                <SkillCard number={0} skill_name={props.participation.skill} />
                            </Col>
                        </Hint>
                        <Col xs={"auto"} className={"participation-remove-student"}>
                            <div className={"participation-delete"}>
                                <Hint message="Remove from this project">
                                    <Image alt={"delete student from project button"} onClick={deleteStudentFromProject} src={red_cross} width={25} height={25} />
                                </Hint>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Card>
        </div>
    )
}