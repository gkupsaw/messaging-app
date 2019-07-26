import React, { Component } from 'react';

export default class Messages extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showUserInfo: false,
            userInfo: { name: '-' }
        }
    }

    componentDidMount = () => {
        let messages = document.getElementById('messages-wrapper');
        messages.scrollTop = messages.scrollHeight;
    }

    componentDidUpdate = () => {
        let messages = document.getElementById('messages-wrapper');
        messages.scroll(0, messages.scrollHeight);
    }

    renderMessages = messagesList =>
        messagesList.reduce((acc, message) => {
            let { id, senderID, senderName, content, senderPhoneNumber } = message,
                myMessage = (senderID === this.props.userID),
                messageElement;
            if (myMessage)
                messageElement = 
                    <div key={id} className={myMessage ? 'my-message' : 'other-message'}>
                        {content}
                    </div>;
            else
                messageElement = 
                    <div key={id} className={myMessage ? 'my-message' : 'other-message'}>
                        <div className='user-icon' style={{ position: 'absolute' }}
                            onClick={() => this.setState({ showUserInfo: true, userInfo: { name: senderName, number: senderPhoneNumber } })}>
                            {senderName[0].toUpperCase()}
                        </div>
                        {content}
                    </div>;
            acc.push(messageElement);
            return acc;
            }, []);

    render = () => <div id='box-messages'>
                        <div className='modal' style={{ transform: this.state.showUserInfo ? 'scale(1)' : 'scale(0)' }}>
                            <div className='modal-icon' onClick={() => this.setState({ showUserInfo: false })}>&times;</div>
                            <div className='user-icon' style={{ fontSize: 80, width: 100, height: 100, cursor: 'none' }}>{this.state.userInfo.name[0].toUpperCase()}</div>
                            <p>{this.state.userInfo.name}</p>
                            <p>{this.state.userInfo.number}</p>
                        </div>
                        <div id='messages-wrapper'>
                            {this.renderMessages(this.props.messages)}
                        </div>
                    </div>;
}