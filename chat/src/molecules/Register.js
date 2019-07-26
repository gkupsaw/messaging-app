import React, { Component } from 'react';
import { Link, Redirect } from "react-router-dom";
import ErrorPopup from '../atoms/ErrorPopup'; 
import Form from '../forms/Form'; 

export default class Register extends Component {

    constructor() {
        super();
        this.state = {
            userID: '',
            errUserExists: false
        };
    }

    handleResponse = res => {
        const { available, userID } = res.data;
        if (!available) {
            this.setState({ errUserExists: true });
        } else if (!userID) {
            console.error('Error creating user in backend, user ID:', userID);
        } else {
            console.log('Registry success, user ID:', userID);
            this.setState({ userID });
        }
    }

    render() {
        if (this.state.userID)
            return <Redirect to={{ pathname: '/room', state: { userID: this.state.userID } }} />
        const inputs = [
            { name: 'username', type: 'text' },
            { name: 'password', type: 'password' }
        ];
        return (
        <div className='register-wrapper'>
            <ErrorPopup errorMessage='Oops! That name is taken.' visible={this.state.errUserExists} close={() => this.setState({ errUserExists: false })} />
            <Form formName='Register' inputs={inputs} submitRoute='/register/user' handleResponse={this.handleResponse} />
            <div>Already have an account? <Link to={'/login'}>Login in here</Link></div>
        </div>
        );
    }
}