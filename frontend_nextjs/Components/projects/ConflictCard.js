import {Button, Card} from "react-bootstrap";
import {useEffect, useState} from "react";
import {api, Url} from "../../utils/ApiClient";

/**
 * Shows the current amount of conflicts, in a card like div.
 * @returns {JSX.Element}
 * @constructor
 */
export default function ConflictCard() {
    const [conflicts, setConflicts] = useState([])

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
    return(<Button variant={"conflicts"}>conflicts {conflicts.length}</Button>)
}