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
        console.log('Adding member...');
        const { socket } = this.props,
              { phoneNumber } = this.state;
        socket.emit('addMember', phoneNumber);
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