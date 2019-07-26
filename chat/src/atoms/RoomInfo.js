import React, { Component } from 'react';
import AddMember from '../forms/AddMember';

export default class RoomInfo extends Component {

    constructor(props) {
        super(props);
        this.state = {
            visible: false
        }
    }

    openOrClose = e => {
        e.stopPropagation();
        let roomListOpener = document.getElementById('open-close-room-list');
        roomListOpener.opacity = this.state.visible ? 1 : 0;
        this.setState({ visible: !this.state.visible });
    }

    render() {
        let members = this.props.members.reduce((acc, member) => acc.concat(<div key={member.id} className='room-list-item'>{member.username}</div>), []);
        members.unshift(<div key='0' className='room-list-item'>Members:</div>);
        return (
            <div id='room-info-wrapper' style={{ width: this.props.visible ? '100%' : 0 }}>
                <AddMember socket={this.socket} />
                <div id='close-room-info' className='fas fa-arrow-circle-left'
                    onClick={this.props.close} />
                <div className='box-links'>{members}</div>
            </div>
        );
    }
}