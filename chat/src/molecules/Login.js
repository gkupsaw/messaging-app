import React, { Component } from 'react';
import { Link, Redirect } from "react-router-dom";
import Form from '../forms/Form';
import ErrorPopup from '../atoms/ErrorPopup';

export default class Login extends Component {

    constructor() {
        super();
        this.state = {
            userID: '',
            errBadCredentials: false,
            errNoUser: false,
        };
    }

    handleResponse = (res, stopWaiting) => {
        if (res.data.userID)
            this.setState({ userID: res.data.userID });
        else if (res.data.noUser) {
            this.setState({ errNoUser: true });
            stopWaiting();
        }
        else if (res.data.badPassword) {
            this.setState({ errBadCredentials: true });
            stopWaiting();
        }
        else stopWaiting();
    }

    render() {
        if (this.state.userID)
            return <Redirect to={{ pathname: '/room', userID: this.state.userID }} />
        const inputs = [
            { name: 'username', type: 'text' },
            { name: 'password', type: 'password' },
        ];
        const { errBadCredentials, errNoUser } = this.state;
        let errorMessage;
        if (errBadCredentials) errorMessage = 'Invalid password.';
        else if (errNoUser) errorMessage = "We couldn't find an account with that name.";
        // else errorMessage = "Oops, something went wrong.";

        return (
            <div className='login-wrapper'>
                <ErrorPopup
                    errorMessage={errorMessage}
                    visible={(errBadCredentials || errNoUser)}
                    close={() => this.setState({ errBadCredentials: false, errNoUser: false })} />
                <Form formName='Login' inputs={inputs} submitRoute='/login/user' handleResponse={this.handleResponse} />
                <div>Don't have an account? <Link to={'/register'}>Create one now</Link></div>
            </div>
        );
    }
}