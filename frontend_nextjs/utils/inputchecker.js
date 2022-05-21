/**
 *  Check if the given body
 *  is valid
 * @param body (projectname, description, required_skills, partner_name, partner_description, edition, users)
 * @returns {boolean}
 */
export function checkProjectBody(body) {
    let response = {"correct" : true }
    let names_list = body.required_skills.map(skill => skill.skill_name)

    if (body.required_skills.some(skill => skill.skill_name === "")) {
        response.problem = "required skills"
    } else if (names_list.some((skill_name, index) => names_list.indexOf(skill_name) !== index)) {
        response.problem = "required skills"
    }

    let should_be_checked = ["name", "description", "partner_name", "partnerdescription"];

    for( check in should_be_checked){
        if (body[check] === ""){
            response.correct = false
            response.problem = check
            return;
        }
    }

    return response
}