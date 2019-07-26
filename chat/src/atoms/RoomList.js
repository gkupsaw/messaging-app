import React, { Component } from 'react';

export default class RoomList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            roomName: ''
        };
    }

    render() {
        const { roomsIDInfo, changeRoom } = this.props;
        let roomLinks = roomsIDInfo.reduce((acc, roomIDInfo) => acc.concat(<div key={roomIDInfo.id} id={roomIDInfo.id} className='room-list-item' onClick={e => changeRoom(e.target.id)}>{roomIDInfo.name}</div>), []);
        return (
            <div id='room-list' style={{ width: this.props.visible ? '100%' : '0px' }} >
                <div id='close-room-list' className='fas fa-plus'
                    onClick={this.props.close} />
                <div id='open-room-list' className='far fa-edit'
                    onClick={() => this.setState({ showModal: true })} />
                <div className='modal' style={{ transform: this.state.showModal ? 'scale(1)' : 'scale(0)' }}>
                    <div className='modal-icon' onClick={() => this.setState({ showModal: false })}>&times;</div>
                    <form onSubmit={e => this.props.createRoom(e, this.state.roomName)}>
                        <input type='text' placeholder='Room Name' value={this.state.roomName}
                            onChange={e => this.setState({ roomName: e.target.value })} />
                        <input type='submit' value='Create' />
                    </form>
                </div>
                <div className='box-links'>{roomLinks}</div>
            </div>
        );
    }
}