import React, {useEffect, useState} from "react";
import {Col, Row} from "react-bootstrap";
import Select from "react-select";
import plus from "/public/assets/plus.svg"
import Image from 'next/image'
import Hint from "../../Components/Hint";
import {api, Url} from "../../utils/ApiClient";

export default function AddUserSelector(props) {
    const [selectedUser, setSelectedUser] = useState({"label": "no user selected", "value": ""});
    const [allAdminUsers, setAllAdminUsers] = useState([]);
    const [allCoachUsers, setAllCoachUsers] = useState([]);
    const [options, setOptions] = useState([])

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!allAdminUsers.length && !allCoachUsers.length && ! loading) {
            setLoading(true)
            Url.fromName(api.users).get().then(res => {
                if (res.success) {
                    for (let u of res.data) {
                        Url.fromUrl(u.id).get().then(async res2 => {
                            if (res2.success) {
                                let user = {"value": u.id, "label": res2.data.data.name}
                                if(res2.data.data.role === 1){
                                    await setAllCoachUsers(prevState => [...prevState, user]);
                                }else if(res2.data.data.role === 2){
                                    await setAllAdminUsers(prevState => [...prevState, user]);
                                }
                            }
                        }).then(() => {
                            setLoading(false)})
                    }
                }
            });
        }
    }, [])

    useEffect(() => {
        setOptions([{ "label": "Admins", "options": allAdminUsers },
            { "label": "Coaches", "options": allCoachUsers }])
    }, [allAdminUsers, allCoachUsers])

    function addUser(){
        if(selectedUser.value !== ""){
            props.addUser(selectedUser.value);
            setSelectedUser({"label": "no user selected", "value": ""})
        }
    }

    const filterOption = (candidate, input) => {
        return ! props.users.includes(candidate.value) && (input === undefined || candidate.label.includes(input))
    };

    return(

        <Row className={"add-user-selector-row"}>
            <Col>
                <Select classNamePrefix="select-search"
                        value={selectedUser}
                        defaultValue={selectedUser}
                        onChange={async (value) => {
                            setSelectedUser(value);
                        }}
                        filterOption={filterOption}
                        noOptionsMessage={() => "No more options"}
                        options={options}
                />

            </Col>
            <Col xs={"auto"}>
                <Hint message="Add selected user to project">
                    <div className={"project-details-plus-skill"} >
                        <Image width={33} height={33} alt={"Add new coach / admin to the project"} src={plus} onClick={() => addUser()} />
                    </div>
                </Hint>
            </Col>
        </Row>
    )
}
