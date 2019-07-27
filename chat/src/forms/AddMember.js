import React, { Component } from 'react';

export default class AddMember extends Component {

    constructor() {
        super();
        this.state = {
            phoneNumber: ''
        };
    }

    handleSubmit = e => {
        e.preventDefault();
        this.props.addMember(this.state.phoneNumber);
        this.setState({ phoneNumber: '' });
    }

    render() {
        return (
            <form id='add-member' onSubmit={this.handleSubmit}>
                <div>Add Member</div>
                <input type='text' value={this.state.phoneNumber}
                    onChange={e => this.setState({ phoneNumber: e.target.value })} />
            </form>
        );
    }
}