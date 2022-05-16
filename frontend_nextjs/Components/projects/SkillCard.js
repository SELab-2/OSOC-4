/**
 * represents a skill and the amount of it that is needed
 * @param props amount the amount of the skill that is needed, name the name of the skill that is needed
 * @returns {JSX.Element}
 * @constructor
 */
export default function SkillCard(props){

    return (
        <div className={"skills-card"} key={`${props.amount}${props.name}`}>
            {(props.number > 0) ? `${props.number}X` : null} {(props.skill_name === null) ? "None" : props.skill_name}
        </div>
    )
}