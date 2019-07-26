import React, { Component } from 'react';
import axios from 'axios';
/* Not in this directory */
import EC2 from '../SERVER';
import NetworkError from '../atoms/NetworkError';

export default class Form extends Component {

    constructor(props)  {
        super(props);
        this.state = { 
            inputs: this.renderInputs(this.props.inputs),
            networkError: undefined,
            submitted: false
        };
    }

    onSubmit = e => {
        e.preventDefault();
        if (!this.state.submitted) {
            let inputs = {}, inputElement;
            this.props.inputs.forEach(input => {
                inputElement = document.getElementById(input.name);
                inputs[input.name] = inputElement.value;
            });
            axios.post(EC2 + this.props.submitRoute, inputs)
                .then(res => this.props.handleResponse(res))
                .catch(err => {
                    console.error('Error submitting form:', err);
                    this.setState({ networkError: err });
                });
            // this.setState({ submitted: true }); // prevents double submit
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
        if (this.state.networkError)
            return <NetworkError networkError={this.state.networkError} />;
        return (
            <form onSubmit={this.onSubmit}>
                <div className='form-header'>{this.props.formName}</div>
                {this.state.inputs}
                <input name='submit' type='submit' value='Submit' />
            </form>
        )
     }
}