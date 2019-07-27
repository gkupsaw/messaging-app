import React, { Component } from 'react';
import axios from 'axios';
/* Not in this directory */
import EC2 from '../SERVER';
import ErrorPopup from '../atoms/ErrorPopup';
import NetworkError from '../atoms/NetworkError';

export default class Form extends Component {

    constructor(props) {
        super(props);
        this.state = {
            inputs: this.renderInputs(this.props.inputs),
            networkError: undefined,
            submitted: false,
            waiting: false
        };
    }

    onSubmit = e => {
        e.preventDefault();
        if (!this.state.submitted) {
            let inputs = {}, inputElement;
            this.setState({ waiting: true });
            this.props.inputs.forEach(input => {
                inputElement = document.getElementById(input.name);
                inputs[input.name] = inputElement.value;
            });
            axios.post(EC2 + this.props.submitRoute, inputs)
                .then(res => {
                    this.props.handleResponse(res, () => this.setState({ waiting: false }));
                })
                .catch(err => {
                    console.error('Error submitting form:', err);
                    this.setState({ networkError: err, waiting: false });
                });
        }
    }

    renderInputs = inputs => {
        let inputComponents =
            inputs.reduce((acc, input) => acc.concat(
                <input name={input.name} className='standard-input' type={input.type} key={input.name} id={input.name}
                    placeholder={input.name.charAt(0).toUpperCase() + input.name.slice(1)} //value={this.state.input.name}
                    onChange={e => this.setState({ [input.name]: e.target.value })}
                    required />
            ), []);
        return inputComponents;
    }

    render() {
        return (
            <form onSubmit={this.onSubmit}>
                <ErrorPopup
                    errorMessage={<NetworkError networkError={this.state.networkError} />}
                    visible={this.state.networkError}
                    close={() => this.setState({ networkError: undefined })} />
                <div className='form-header'>{this.props.formName}</div>
                {this.state.inputs}
                <input name='submit' type='submit' value='Submit'
                    style={{ display: this.state.waiting ? 'none' : 'block' }} />
                <div className='fas fa-circle-notch fa-spin' style={{ display: this.state.waiting ? 'block' : 'none' }} />
            </form>
        )
    }
}