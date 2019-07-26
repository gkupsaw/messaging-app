const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: String,
    id: String,
    members: [{
        username: String,
        id: String
    }],
    messages: [{
        senderID: String,
        senderName: String,
        senderPhoneNumber: String,
        id: String,
        timestamp: String,
        content: String
    }]
});
const Room = mongoose.model('Room', roomSchema);

const userSchema = new mongoose.Schema({
        username: String,
        password: { type: String, select: false },
        id: String,
        phoneNumber: String,
        rooms: [{
            name: String,
            id: String
        }],
        lastRoomID: String
    });
const User = mongoose.model('User', userSchema);

// using one schema is extremely inefficient. when a user joins a room or sends a message, every user must be updated
// to match the new room state. instead, storing user documents room documents allows user documents to simply
// contain references to room documents. when messages are sent or member join, it is just that one room document
// that is updated as opposed to every user document.

const generateRandIdentifier = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    let result = '';
    for (let i = 0; i < 6; i++)
        result += chars[(Math.floor(Math.random() * chars.length))];

    return result;
}

module.exports = {

    roomSchema,

    Room,

    userSchema,

    User,

    generateRandIdentifier

}