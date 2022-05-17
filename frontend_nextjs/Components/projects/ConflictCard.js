import {Button, Card} from "react-bootstrap";
import {useEffect, useState} from "react";
import {api, Url} from "../../utils/ApiClient";
import ConflictsPopUpWindow from "./ConflictsPopUpWindow";

/**
 * Shows the current amount of conflicts, in a card like div.
 * @returns {JSX.Element}
 * @constructor
 */
export default function ConflictCard() {
    const [conflicts, setConflicts] = useState([])

    const [conflictsShow, setConflictsShow] = useState(false);

    /**
     * Loads once after the component mounts, it sets the conflicts state.
     */
    useEffect(() => {
        Url.fromName(api.current_edition).extend("/resolving_conflicts").get().then(res => {
            if(res.success){
                setConflicts(res.data)
            }
        })
    }, [])
    /**
     * returns the current amount of conflicts
     */
    return(
        <div>
            <ConflictsPopUpWindow popUpShow={conflictsShow} setPopUpShow={setConflictsShow}
                                   conflicts={conflicts} />
            <Button variant={"conflicts"} onClick={() => setConflictsShow(true)}>conflicts {conflicts.length}</Button>
        </div>
    )
}