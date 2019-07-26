import React, { Component } from 'react';
import { Link, Redirect } from "react-router-dom";
import Form from '../forms/Form'; 

export default class Login extends Component {

    constructor() {
        super();
        this.state = {
            userID: '',
            errBadCredentials: false
        };
    }

    handleResponse = res => res.data.userID 
                                ? this.setState({ userID: res.data.userID })
                                : this.setState({ errBadCredentials: true });

    render() {
        if (this.state.userID)
            return <Redirect to={{ pathname: '/room', userID: this.state.userID }} />
        const inputs = [
            { name: 'username', type: 'text' },
            { name: 'password', type: 'password' }
        ];
        return (
            <div className='login-wrapper'>
                <Form formName='Login' inputs={inputs} submitRoute='/login/user' handleResponse={this.handleResponse} />
                <div>Don't have an account? <Link to={'/register'}>Create one now</Link></div>
            </div>
        );
    }
}