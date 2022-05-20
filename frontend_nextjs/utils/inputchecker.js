/**
 *  Check if the given body
 *  is valid
 * @param body (projectname, description, required_skills, partner_name, partner_description, edition, users)
 * @returns {boolean}
 */
export function checkProjectBody(body) {
    let response = {"correct" : false }
    let names_list = body.required_skills.map(skill => skill.skill_name)

    if (body.required_skills.some(skill => skill.skill_name === "")) {
        response.problem = "required skills"
    } else if (names_list.some((skill_name, index) => names_list.indexOf(skill_name) !== index)) {
        response.problem = "required skills"
    } else if (body.name === ""){
        response.problem = "name"
    } else if (body.description === ""){
        response.problem = "project description"
    } else if (body.partner_name === ""){
        response.problem = "partner name"
    } else if (body.partner_description === ""){
        response.problem = "partner description"
    } else {
        response.correct = true
    }
    return response
}