import React, {useEffect, useState} from "react";
import {Url} from "../../utils/ApiClient";
import {Col, Row} from "react-bootstrap";
import Image from "next/image";
import red_cross from "../../public/assets/wrong.svg";

/**
 * Shows the user in a color according to the users role
 * @param props user the user that needs to be displayed
 * @returns {JSX.Element}
 * @constructor
 */
export default function AdminCard(props){

    const [user, setUser] = useState({})
    const [loading, setLoading] = useState(false)
    const cssClasses = ["coach-div", "admin-div"]
    /**
     * Loads once after mounting the component and sets the user state
     */
    useEffect(() => {
        if(! loading) {
            setLoading(true)
            Url.fromUrl(props.user).get().then(async user => {
                if (user.success) {
                    setUser(user.data.data)
                }
            })
        }
    }, [])

    /**
     * Selects the correct css class for the user state,
     * if the user is an admin => admin-div if the user is a coach => coach-div
     * @returns {string}
     */
    function getCssClass(){
        if(Object.keys(user).length && user.role > 0){
            return cssClasses[user.role - 1]
        }
    }

    /**
     * returns the name of the user with a css layout according to the users role
     */
    return (
        <Row key={props.user} className={getCssClass()}>
            <Col>
                {user.name}
            </Col>
            {props.showEdit ? <Col xs={"auto"}>
                    <Image alt={"remove user"} src={red_cross} width={20} height={20} onClick={() => props.deleteUser(props.index) }/>
                </Col> :
                null
            }
        </Row>
    )

}