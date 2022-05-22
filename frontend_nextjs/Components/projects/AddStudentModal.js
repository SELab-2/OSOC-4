import { Button, Modal, Form } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import SkillSelector from "./SkillSelector";
import { api, Url } from "../../utils/ApiClient";
import { StringListToOptionsList } from "../../utils/skillselector";



/**
 * When clicking on the button to assign a student to a project, this modal pops-up. If the selected student and project
 * are a valid combination then you can select a skill and add the student to the project. Otherwise, a modal screen pops-up
 * with the reason why the student and project aren't a valid combination.
 *
 * @param props setSelectedStudent the setter for the currently selected student on the project page,
 * selectedStudent the currently selected student on the project page,
 * setSelectedProject the setter for the currently selected project on the project page,
 * selectedProject the currently selected project on the project page
 * @returns {JSX.Element}
 * @constructor
 */
export default function AddStudentModal(props) {

    const [selectedSkill, setSelectedSkill] = useState({ "value": "None", "label": "None" })

    const [skills, setSkills] = useState([])
    const [projectNeededSkills, setProjectNeededSkills] = useState([]);
    const [reason, setReason] = useState("");
    const [options, setOptions] = useState([{ "value": "None", "label": "None" }])


    /**
     * This function gets called when props.selectedStudent or props.selectedProject changes. It finds the intersection
     * of the required skills of the selected project and the skills of the selected student
     */
    useEffect(() => {
        if (props.selectedProject !== undefined) {
            let temp_dict = {}
            props.selectedProject.required_skills.map(skill => {
                temp_dict[skill.skill_name] = skill.number
            })

            Object.values(props.selectedProject.participations).forEach(participation => {
                if (participation.skill in temp_dict) {
                    temp_dict[participation.skill] -= 1;
                }
            })

            setProjectNeededSkills(Object.keys(temp_dict).filter(skill => temp_dict[skill] > 0))
        }
    }, [props.selectedProject])


    /**
     * This useEffect initializes the skills state variable.
     */
    useEffect(() => {
        Url.fromName(api.skills).get().then(res => {
            if (res.success) {
                setSkills(res.data)
            }
        })
    }, [])

    /**
     * This function classifies the skills in the skill categories, depending on the selected student. Then it sets the
     * options state variable.
     */
    useEffect(() => {
        if (skills.length !== 0 && props.selectedStudent !== undefined && projectNeededSkills.length !== 0) {
            let studentClean = props.selectedStudent.skills.map(value => value.name)
            let overlap = StringListToOptionsList(studentClean.filter(skill => projectNeededSkills.includes(skill)))
            let studentSkills = StringListToOptionsList(studentClean.filter(skill => !projectNeededSkills.includes(skill)))
            let projectSkills = StringListToOptionsList(projectNeededSkills.filter(skill => !studentClean.includes(skill)))
            let otherSkills = StringListToOptionsList(skills.filter(skill => !projectNeededSkills.includes(skill)
                && !studentClean.includes(skill)))
            setOptions([{ "value": "None", "label": "None" },
            { "label": "Student project overlap", "options": overlap },
            { "label": "Student skills", "options": studentSkills },
            { "label": "Project needed skills", "options": projectSkills },
            { "label": "Other skills", "options": otherSkills }])
        }
    }, [skills, projectNeededSkills, props.selectedStudent])

    /**
     * Creates particpation of props.selectedStudent, props.selectedProject and selectedSkill.
     * @returns {Promise<void>}
     * @constructor
     */
    async function AddStudentToProject() {
        if (props.selectedStudent !== undefined && props.selectedProject !== undefined && selectedSkill !== undefined) {
            let response = await Url.fromName(api.participations)
                .extend("/create")
                .setBody({
                    "student_id": props.selectedStudent.id.split("/").pop(),
                    "project_id": props.selectedProject.id.split("/").pop(),
                    "skill_name": selectedSkill.value === "None" ? "" : selectedSkill.value,
                    "reason": reason
                })
                .post();
        }
    }

    /**
     * Handle the changes in the reason input bar.
     * @param event
     */
    const handleChange = (event) => {
        event.preventDefault();
        setReason(event.target.value);
    }

    /**
     * This reset is called when the AddStudentModel is hidden. It makes the modal window invisible and resets the
     * reason and selected skill.
     */
    const reset = () => {
        props.setShowAddStudent(false);
        setSelectedSkill({ "value": "None", "label": "None" });
        setReason("");
    }
    /**
     * this modal screen allows you to select a valid skill and create a participation of the selectedStudent, props.selectedProject
     * and selectedSkill
     * @returns {JSX.Element}
     */
    function getAddModal() {
        return (
            <Modal show={props.showAddStudent} onHide={() => {reset();}}>
                <Modal.Header closeButton>
                    <Modal.Title>Add {props.selectedStudent["mandatory"]["first name"]} {props.selectedStudent["mandatory"]["last name"]} to {props.selectedProject.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="student-modal-screen-title">Why are you making this decision?</div>
                    <p>A reason is not required, but will open up discussion and help us and your fellow coaches to understand.</p>
                    <Form.Control type="text" id="suggestin-reason" name="reason" className="fill_width suggestion-reason"
                     onChange={handleChange} value={reason} placeholder="Your reason"/>
                    <div className="student-modal-screen-title">For which skill requirement do you want to add {props.selectedStudent["mandatory"]["first name"]} {props.selectedStudent["mandatory"]["last name"]} to the project?</div>
                    <div className="student-modal-screen-skillselector">
                        <SkillSelector selectedSkill={selectedSkill} setSelectedSkill={setSelectedSkill}
                            options={options}
                        />
                    </div>
                    
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={async () => {await AddStudentToProject();reset();}}>
                        Add student to project
                    </Button>

                </Modal.Footer>
            </Modal>)
    }

    /**
     * this modal screen shows if the props.selectedStudent already has a particpation involving props.selectedProject
     * @returns {JSX.Element}
     */
    function getAlreadyAddedModal() {
        return (
            <Modal show={props.showAddStudent} onHide={() => props.setShowAddStudent(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{props.selectedStudent["mandatory"]["first name"]} {props.selectedStudent["mandatory"]["last name"]} can not be added to {props.selectedProject.name} project</Modal.Title>
                </Modal.Header>
                <Modal.Body>The selected student already is assigned to the selected project.</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => props.setShowAddStudent(false)}>
                        Go back to the project tab
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }

    /**
     * This modal shows if either or both of props.selectedStudent, props.selectedProject are undefined
     * @returns {JSX.Element}
     */
    function getMustSelect() {
        return (
            <Modal show={props.showAddStudent} onHide={() => props.setShowAddStudent(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>No selected {props.selectedStudent === undefined ? "student" : "project"}{(props.selectedStudent === undefined && props.selectedProject === undefined) ? " or project" : ""}</Modal.Title>
                </Modal.Header>
                <Modal.Body>To add a student to a project you must both select a student and project. You can do this by clicking on a student and clicking on the checkmark of a project.</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => props.setShowAddStudent(false)}>
                        Go back to the project tab
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }

    /**
     * returns the correct modal screen
     */
    return (<div>
        {
            (props.selectedStudent !== undefined && props.selectedProject !== undefined) ?
                ((!Object.values(props.selectedProject.participations).map(p => p.student).includes(props.selectedStudent.id)) ?
                    getAddModal() : getAlreadyAddedModal()) : getMustSelect()
        }
    </div>)
}