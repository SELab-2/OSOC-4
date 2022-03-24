import {useState} from "react";
import {Card} from "react-bootstrap";
import { Button } from 'react-bootstrap';

export default function SettingCards(props) {
    const [isOpen, setIsOpen] = useState(false)
    return(
        <div className="align-content-center">
            <Card className="card">
                <Card.Body>
                    <table className="table">
                        <tbody>
                        <tr className={"tr"}>
                            <td className="column-icon">
                                <p>ICON</p>
                            </td>
                            <td className="column-text">
                                <span className="card-title">{props.title}</span>
                                <p className="card-subtitle">{props.subtitle}</p>
                            </td>
                            <td className="column-button">
                                <Button className={"button"} variant="outline-secondary" onClick={() => setIsOpen(! isOpen)} enabled="true">{isOpen ? "Close" : "Change" }</Button>
                            </td>
                        </tr>
                        </tbody>
                        <tfoot className={"tfoot"}/>
                    </table>
                </Card.Body>
                {isOpen ? (<div className={"details-div"}>
                    <hr/>
                    {props.children}
                </div>) : null}
            </Card>
        </div>
    )
}