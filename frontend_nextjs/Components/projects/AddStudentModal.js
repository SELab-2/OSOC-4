import {Button, Modal} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import SkillSelector from "./SkillSelector";
import {api, Url} from "../../utils/ApiClient";

/**
 * When clicking on the button to assign a student to a project, this modal pops-up. If the selected student and project
 * are a valid combination then you can select a skill and add the student to the project. Otherwise a modal screen pops-up
 * with the reason why the student and project aren't a valid combination.
 *
 * @param props setSelectedStudent the setter for the currently selected student on the project page,
 * selectedStudent the currently selected student on the project page,
 * setSelectedProject the setter for the currently selected project on the project page,
 * selectedProject the currently selected project on the project page
 * @returns {JSX.Element}
 * @constructor
 */
export default function AddStudentModal(props){

    const [selectedSkill, setSelectedSkill] = useState(undefined)

    const [skills, setSkills] = useState([])
    /**
     * This function gets called when props.selectedStudent or props.selectedProject changes. It finds the intersection
     * of the required skills of the selected project and the skills of the selected student
     */
    useEffect(() => {
        setSelectedSkill(undefined)
        if(props.selectedStudent !== undefined && props.selectedProject !== undefined){
            let temp_dict = {}
            props.selectedProject.required_skills.map(skill => {
                temp_dict[skill.skill_name] = skill.number
            })

            props.selectedProject.participations.map(participation => {
                temp_dict[participation.skill] = temp_dict[participation.skill] - 1 ;
            })

            // first map the skill names in an array
            let skill_name_array = Object.keys(temp_dict)

            // check if the name of a students skill is in the needed skill list of a projectlog(props.selectedStudent.skills.filter(s => skill_name_array.includes(s.name)))
            let valid_skills =  props.selectedStudent.skills.filter(s => skill_name_array.includes(s.name))

            setSkills(valid_skills.map(s => ({"value": s.name, "name": s.name})))
        }
    }, [props.selectedStudent, props.selectedProject])

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
                    "skill_name": selectedSkill})
                .post()
        }
    }

    /**
     * this modal screen allows you to select a valid skill and create a participation of the selectedStudent, props.selectedProject
     * and selectedSkill
     * @returns {JSX.Element}
     */
    function getAddModal() {
        return(
            <Modal show={props.showAddStudent} onHide={() => props.setShowAddStudent(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add {props.selectedStudent["mandatory"]["first name"]} {props.selectedStudent["mandatory"]["last name"]} to {props.selectedProject.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        For which skill requirement do you want to add {props.selectedStudent["mandatory"]["first name"]} {props.selectedStudent["mandatory"]["last name"]} to the project?
                    </div>
                    <SkillSelector selectedSkill={selectedSkill} setSelectedSkill={setSelectedSkill} skills={skills}/>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => {
                        props.setShowAddStudent(false)
                        setSelectedSkill(undefined)}}>
                        Dont add student to project
                    </Button>
                    <Button variant="primary" onClick={async () => {
                        await AddStudentToProject()
                        props.setShowAddStudent(false)
                        setSelectedSkill(undefined)
                    }}>
                        Add student to project
                    </Button>

                </Modal.Footer>
            </Modal>)
    }

    /**
     * this modal screen shows if the props.selectedStudent already has a particpation involving props.selectedProject
     * @returns {JSX.Element}
     */
    function getAlreadyAddedModal(){
        return(
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
     * This modal shows if the props.selectedStudent doesn't have a skill required of the props.selectedProject
     * @returns {JSX.Element}
     */
    function getMustHaveValidSkill(){
        return(
            <Modal show={props.showAddStudent} onHide={() => props.setShowAddStudent(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{props.selectedStudent["mandatory"]["first name"]} {props.selectedStudent["mandatory"]["last name"]} has no required skills for the {props.selectedProject.name} project</Modal.Title>
                </Modal.Header>
                <Modal.Body>A student must have a required skill of the selected project to be added to that project.</Modal.Body>
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
    function getMustSelect(){
        return(
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
    return(<div>
        {(props.selectedStudent !== undefined && props.selectedProject !== undefined) ?
            ((skills.length > 0 ) ?
                    ((! props.selectedProject.participations.map(p => p.student).includes(props.selectedStudent.id)) ?
                            getAddModal() : getAlreadyAddedModal()) : getMustHaveValidSkill()) : getMustSelect()
        }
    </div>)
}