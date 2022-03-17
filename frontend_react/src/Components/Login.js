import React from "react";
import {Navigate} from "react-router-dom";


import {login} from "../utils/json-requests";
import {log} from "../utils/logger";

export default class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: "",
            password: "",
        };

        // bind this to the functions
        this.handleChangeText = this.handleChangeText.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChangeText(event) {
        console.log("handle change text: (" + Object.keys(event) + ")")
        const target = event.target;
        this.setState({[target.name]: target.value});
    }

    async handleSubmit(event) {
        log("handle login submit")
        event.preventDefault();

        let credentials = JSON.stringify({
            "email": this.state.email,
            "password": this.state.password
        });
        log(credentials)
        // post, if any errors, show them
        let output = await login("/login", credentials);
        console.log(output)
        if (output.success) {
            // todo reroute to "/"
        }
    }

    render() {
        if (this.state.failed) {
            return (
                <Navigate to={{pathname: "/login"}}/>
            );
        }

        return (
            <div className="body">
                <div className="login-container">
                    <p className="welcome-message">Please provide login credentials to proceed</p>
                    <div className="login-form">
                        <form onSubmit={this.handleSubmit}>
                            <input type="email" name="email" value={this.state.email} onChange={this.handleChangeText} placeholder="Email address"/>
                            <input type="password" name="password" value={this.state.password} onChange={this.handleChangeText} placeholder="Password"/>
                            <input className="submit" type="submit" name="submit" value="Login"/>
                        </form>
                    </div>
                </div>
            </div>
        )
    }


}
