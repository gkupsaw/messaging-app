import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import openSocket from 'socket.io-client';
import RoomList from '../atoms/RoomList';
import RoomInfo from '../atoms/RoomInfo';
import Messages from '../atoms/Messages';
import NetworkError from '../atoms/NetworkError';
import ErrorPopup from '../atoms/ErrorPopup';
import SendMessage from '../forms/SendMessage';
import EC2 from '../SERVER';

export default class Room extends Component {
    constructor() {
        super();
        this.socket = openSocket(EC2);
        this.state = {
            roomsIDInfo: [],
            currentRoom: { messages: [], members: [] },
            networkError: undefined,
            user: {},
            loading: true,
            roomListOpen: false,
            roomInfoOpen: false,
        };
    }

    componentWillUnmount = () => this.socket.emit('disconnect');

    componentDidMount = () => {
        try {
            axios
                .post(EC2 + '/get/user/data', { userID: this.props.location.state.userID })
                .then(async res => {
                    const { user } = res.data;
                    const roomID = user.lastRoomID ? user.lastRoomID : user.rooms[0].id;
                    await axios
                        .post(EC2 + '/get/room', { id: roomID })
                        .then(res => {
                            const roomsIDInfo = user.rooms.reduce((acc, room) => acc.concat({ name: room.name, id: room.id }), []);
                            this.setState({
                                user,
                                roomsIDInfo,
                                currentRoom: res.data.room,
                                loading: false,
                            });
                            this.setupSocket(user, res.data.room.id);
                        })
                })
        } catch (err) {
            console.error(err);
            this.setState({
                networkError: err,
                loading: false,
            })
        }
    };

    setupSocket = (user, currentRoomID) => {
        const socket = this.socket;

        socket.on('membershipChanged', updatedRoom => {
            console.log('new member');
            this.setState({ currentRoom: updatedRoom });
        });

        socket.on('newMessageClient', updatedRoom => {
            console.log('new message');
            this.setState({ currentRoom: updatedRoom });
        });

        socket.emit('join', currentRoomID, user);
    };

    changeRoom = newRoomID =>
        axios
            .post(EC2 + '/get/room', { id: newRoomID })
            .then(res => this.setState({ currentRoom: res.data.room, roomListOpen: false, }))
            .then(() => this.socket.emit('disconnect'))
            .then(() => this.socket.emit('join', this.state.currentRoom.id, this.state.user))
            .catch(err => console.error('Error getting room data:', err));

    createRoom = (e, roomName) => {
        e.preventDefault();
        axios
            .post(EC2 + '/create/room', {
                roomName,
                username: this.state.user.username,
                userID: this.state.user.id,
            })
            .then(() => window.location.reload(true))
            .catch(err => console.error('Error creating new room:', err));
    };

    render() {
        if (this.state.networkError)
            return <NetworkError err={this.state.networkError} />;
        else if (!this.props.location.state || !this.props.location.state.userID)
            return <Redirect to={'/login'} />;
        else if (this.state.loading) return <div />;
        const {
            roomsIDInfo,
            roomListOpen,
            roomInfoOpen,
            currentRoom,
            user,
        } = this.state;
        const {
            username,
            phoneNumber
        } = user;
        const { userID } = this.props.location.state;
        return (
            <div id='room-wrapper'>
                <ErrorPopup
                    errorMessage={<NetworkError networkError={this.state.networkError} />}
                    visible={this.state.networkError}
                    close={() => this.setState({ networkError: undefined })} />
                <div id='message-top-bar' style={{ height: roomInfoOpen || roomListOpen ? 0 : '10vh' }} >
                    <p>{currentRoom.name}</p>
                    <p>My Number: {user.phoneNumber}</p>
                    <div id='open-room-list' className='fas fa-plus'
                        onClick={() => this.setState({ roomListOpen: true })} />
                    <div id='open-room-info' className='fas fa-info-circle'
                        onClick={() => this.setState({ roomListOpen: false, roomInfoOpen: true })} />
                </div>
                <div id='room-content-wrapper'>
                    <RoomList
                        roomsIDInfo={roomsIDInfo}
                        visible={roomListOpen}
                        close={() => this.setState({ roomListOpen: false })}
                        changeRoom={this.changeRoom}
                        createRoom={this.createRoom} />
                    <div id='messaging-wrapper' style={{ width: roomInfoOpen || roomListOpen ? 0 : '100%' }} >
                        <Messages
                            messages={currentRoom.messages}
                            userID={userID} />
                        <SendMessage
                            send={message => this.socket.emit('newMessageServer', message, { id: userID, username, phoneNumber })} />
                    </div>
                    <RoomInfo
                        members={currentRoom.members}
                        visible={roomInfoOpen}
                        addMember={phoneNumber => this.socket.emit('addMember', phoneNumber)}
                        close={() => this.setState({ roomInfoOpen: false })} />
                </div>
            </div>
        );
    }
}
