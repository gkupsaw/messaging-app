import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import openSocket from 'socket.io-client'
import RoomList from '../atoms/RoomList';
import RoomInfo from '../atoms/RoomInfo';
import Messages from '../atoms/Messages';
import NetworkError from '../atoms/NetworkError';
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
            roomInfoOpen: false
        };
    }

    componentWillUnmount = () => this.socket.emit('disconnect');

    componentDidMount = () => {
        try {
            axios.post(EC2 + '/get/user/data', { userID: this.props.location.state.userID })
                .then(async res => {
                    const { user } = res.data;
                    console.log('User data received:', user);
                    const roomID = user.lastRoomID ? user.lastRoomID : user.rooms[0].id;
                    await axios.post(EC2 + '/get/room', { id: roomID })
                        .then(res => {
                            console.log('Room data received:', res.data.room);
                            this.setState({
                                user,
                                roomsIDInfo: user.rooms.reduce((acc, room) => acc.concat({ name: room.name, id: room.id }), []), 
                                currentRoom: res.data.room,
                                loading: false
                            });
                            this.setupSocket(user, res.data.room.id);
                        })
                        .catch(err => console.error('Error getting room data:', err));
                })
                .catch(err => {
                    console.log('Error getting data:', err);
                    this.setState({ 
                        networkError: err,
                        loading: false
                    });
                });
        } catch(err) {
            console.error(err);
        }
    }
    
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
    }

    changeRoom = async newRoomID => {
        await axios.post(EC2 + '/get/room', { id: newRoomID })
            .then(res => this.setState({ currentRoom: res.data.room, roomListOpen: false }))
            .catch(err => console.error('Error getting room data:', err));
        this.socket.emit('disconnect');
        this.socket.emit('join', this.state.currentRoom.id, this.state.user);
    }

    createRoom = (e, roomName) => {
        e.preventDefault();
        axios.post(EC2 + '/create/room', { roomName, username: this.state.user.username, userID: this.state.user.id })
            .then(() => window.location.reload(true))
            .catch(err => console.error('Error creating new room:', err));
    }

    render() {
        if (this.state.networkError)
            return <NetworkError err={this.state.networkError} />;
        else if (!this.props.location.state || !this.props.location.state.userID)
            return <Redirect to={'/login'} />;
        else if (this.state.loading)
            return <div />;
        const { roomsIDInfo, roomListOpen, roomInfoOpen, currentRoom, user } = this.state,
              { userID } = this.props.location.state;
        return (
            <div id='room-wrapper'>
                <div id='message-top-bar'>
                    <p>{currentRoom.name}</p>
                    <div id='open-room-list' className='fas fa-plus'
                        onClick={() => this.setState({ roomListOpen: true })} />
                    <div id='open-room-info' className='fas fa-info-circle'
                        onClick={() => this.setState({ roomListOpen: false, roomInfoOpen: true })} />
                </div>
                <div id='room-content-wrapper'>
                    <RoomList changeRoom={this.changeRoom} roomsIDInfo={roomsIDInfo} 
                        visible={roomListOpen} close={() => this.setState({ roomListOpen: false })}
                        createRoom={this.createRoom} socket={this.socket} />
                    <div id='messaging-wrapper' style={{ width: (roomInfoOpen || roomListOpen) ? 0 : '100%' }}>
                        <Messages messages={currentRoom.messages} userID={userID} />
                        <SendMessage socket={this.socket} user={{ id: userID, username: user.username, phoneNumber: user.phoneNumber }} />
                    </div>
                    <RoomInfo members={currentRoom.members} 
                        visible={roomInfoOpen} close={() => this.setState({ roomInfoOpen: false })} />
                </div>
            </div>
        );
    }
}