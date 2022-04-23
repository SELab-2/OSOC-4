import {Card} from "react-bootstrap";


// TODO add extra info on hover
export default function ParticipationCard(props){

    return(
        <Card>
            <p>{props.participation.skill}</p>
            <p>{props.participation.student}</p>
        </Card>
    )
}