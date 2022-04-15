import {Button, Card} from "react-bootstrap";
import {useEffect, useState} from "react";
import {getJson} from "../../utils/json-requests";
import {urlManager} from "../../utils/ApiClient";
import {log} from "../../utils/logger";


export default function ConflictCard(props) {
    const [conflicts, setConflicts] = useState([])


    // useEffect(() => {
    //     if(conflicts.length === 0){
    //         urlManager.getConflicts().then(async conflict_url => {
    //             let conflicts = await getJson(conflict_url)
    //             log(conflicts)
    //             if(conflicts){
    //                 setConflicts(conflicts)
    //             }
    //         })
    //     }
    // }, [conflicts])

    return(
        <div>
            <Button variant={"conflicts"}>conflicts {conflicts.length}</Button>
        </div>
    )
}