/**
 *  Check if the given body
 *  is valid
 * @param body (projectname, description, required_skills, partner_name, partner_description, edition, users)
 * @returns {boolean}
 */
export function checkProjectBody(body) {
    let response = {"correct" : true }
    if (body.required_skills.some(skill => skill.skill_name === "")) {
        response.correct = false
    }
    let names_list = body.required_skills.map(skill => skill.skill_name)
    if (names_list.some((skill_name, index) => names_list.indexOf(skill_name) !== index)) {
        response.correct = false
    }
    if (body.name === ""){
        response.correct = false
    }

    if (body.projectDescription === ""){
        response.correct = false
    }

    if (body.partnerName === ""){
        response.correct = false
    }

    if (body.partnerDescription === ""){
        response.correct = false
    }

    return response
}