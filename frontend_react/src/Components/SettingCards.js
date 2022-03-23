import {useState} from "react";
import {Card} from "react-bootstrap";
import { Button } from 'react-bootstrap';
import "../styles/SettingCards.css"

export default function SettingCards(props) {
    const [isOpen, setIsOpen] = useState(false)
    return(
        <div>
            <Card className="card">
                <Card.Body>
                    <table className="table">
                        <tr>
                            <td className="column-icon">
                                <p>ICON</p>
                            </td>
                            <td className="column-text">
                                <span className="card-title">{props.title}</span>
                                <p className="card-subtitle">{props.subtitle}</p>
                            </td>
                            <div className="column-button">
                                <Button variant="outline-secondary" onClick={() => setIsOpen(! isOpen)} enabled="true">{isOpen ? "Close" : "Change" }</Button>
                            </div>
                        </tr>
                    </table>
                </Card.Body>
            </Card>
            {isOpen ? props.children : null}
        </div>
)
}
