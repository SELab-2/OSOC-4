import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {getJson} from "../../utils/json-requests";
import {log} from "../../utils/logger";

const Project = () => {
    const router = useRouter()
    const { project_id } = router.query
    const [loaded, setLoaded] = useState(false)
    const [project, setProject] = useState(undefined)

    useEffect(() => {
        if (! loaded) {
            getJson("/projects" + "/" + project_id).then(res => {
                log("load project")
                log(res)
                setProject(res.data)
                setLoaded(true)
            });
        }
    })

    return (
        <div>
            { loaded ? <p>{project.name}</p> : null}
        </div>

    )
}

export default Project;