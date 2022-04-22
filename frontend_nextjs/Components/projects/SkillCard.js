import {Card} from "react-bootstrap";

// TODO add extra info on hover
export default function SkillCard(props){

    return (
        <Card>
            <p>{props.amount}X {props.name}</p>
        </Card>
    )
}