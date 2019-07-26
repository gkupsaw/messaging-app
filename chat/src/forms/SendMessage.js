import React, { Component } from 'react';

export default class SendMessage extends Component {

    constructor() {
        super();
        this.state = {
            message: ''
        };
    }

    handleSubmit = e => {
        e.preventDefault();
        console.log('Sending message...');
        const { socket, user } = this.props,
              { message } = this.state;
        socket.emit('newMessageServer', message, user);
        this.setState({ message: '' });
    }

    render() {
        return (
            <div id='message-sending-form'>
                <input id='message-sender' value={this.state.message} name='send message' onKeyPress={e => e.charCode===13 && this.send.click()}
                        onChange={e => this.setState({ message: e.target.value })} autoFocus={true} placeholder='Type something...' />
                <div type='submit' ref={elem => this.send = elem} id='send' className='fas fa-arrow-circle-up' onClick={this.handleSubmit} />
            </div>
        );
    }
}