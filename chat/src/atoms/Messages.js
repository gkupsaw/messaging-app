import React, { Component } from 'react';

export default class Messages extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showUserInfo: false,
            userInfo: { name: '-' }
        };
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
                // phoneNumber = senderPhoneNumber.slice(0, 3) + '-' + senderPhoneNumber.slice(3, 6) + '-' + senderPhoneNumber.slice(6),
                userInfo = { name: senderName, number: senderPhoneNumber },
                onIconClick = () => this.setState({ showUserInfo: true, userInfo }),
                userIcon = myMessage
                    ? <div />
                    : <div className='user-icon' onClick={onIconClick}>{senderName[0].toUpperCase()}</div>;
            acc.push(<div key={id} className={myMessage ? 'my-message' : 'other-message'}> {userIcon} {content} </div>);
            return acc;
        }, []);

    render = () =>
        <div id='box-messages'>
            <div className='modal' style={{ transform: this.state.showUserInfo ? 'scale(1)' : 'scale(0)' }}>
                <div className='modal-icon' onClick={() => this.setState({ showUserInfo: false })}>&times;</div>
                <div className='user-icon-big'>{this.state.userInfo.name[0].toUpperCase()}</div>
                <p>{this.state.userInfo.name}</p>
                <p>{this.state.userInfo.number}</p>
            </div>
            <div id='messages-wrapper'>
                {this.renderMessages(this.props.messages)}
            </div>
        </div>;
}