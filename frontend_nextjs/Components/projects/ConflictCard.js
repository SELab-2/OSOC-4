import {Button} from "react-bootstrap";
import { useState} from "react";
import ConflictsPopUpWindow from "./ConflictsPopUpWindow";

/**
 * Shows the current amount of conflicts, in a card like div.
 * @returns {JSX.Element} The component that renders the current amount of conflicts, in a card like div.
 * @constructor
 */
export default function ConflictCard(props) {
    const [conflictsShow, setConflictsShow] = useState(false);
  
    /**
     * returns the current amount of conflicts
     */
    return(
        <div>
            <ConflictsPopUpWindow popUpShow={conflictsShow} setPopUpShow={setConflictsShow}
                                   conflicts={props.conflicts} />
            <Button style={{backgroundColor: "var(--conflicts-background)", borderWidth: "0"}}
                    onClick={() => setConflictsShow(true)}>conflicts {props.conflicts.length}</Button>
        </div>
    )
}