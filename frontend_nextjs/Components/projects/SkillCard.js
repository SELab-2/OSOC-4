import {Card, Col, Row} from "react-bootstrap";

// TODO add extra info on hover
export default function SkillCard(props){

    return (
        <div className={"skills-card"}>
            {(props.amount > 0) ? `${props.amount}X` : null} {props.name}
        </div>
    )
}