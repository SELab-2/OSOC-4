/**
 * represents a skill and the amount of it that is needed
 * @param props amount the amount of the skill that is needed, name the name of the skill that is needed
 * @returns {JSX.Element}
 * @constructor
 */
export default function SkillCard(props){

    return (
        <div className={"skills-card"} key={`${props.amount}${props.name}`}>
            {(props.amount > 0) ? `${props.amount}X` : null} {props.name}
        </div>
    )
}