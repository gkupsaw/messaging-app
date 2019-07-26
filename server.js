require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const MongoQueries = require('./MongoQueries.js');
const MongoSchemas = require('./MongoSchemas.js');
const User = MongoSchemas.User;
const Room = MongoSchemas.Room;
const port = process.env.PORT;

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

const db = mongoose.connection;

db.once('open', () => {    // bind a function to perform when the database has been opened
  console.log("Connected to DB!".green);
});
process.on('SIGINT', () => {   //CTR-C to close
   mongoose.connection.close(() => {
       console.log('DB connection closed by Node process ending'.yellow);
       process.exit(0);
   });
});
const url = process.env.DB_HOST;

mongoose.connect(url, { useNewUrlParser: true, w: 1 }) //write concerns
        .catch(err => console.error('Error connecting to DB:'.red, err));   

db.on('error', console.error); // log any errors that occur

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

const http = require('http');
const server = http.createServer(app);
const io = require('socket.io').listen(server);
let _rooms = new Map();  // mapping from room ID to room array of active_members: [usernames]

io.sockets.on('connection', socket => {
    socket.on('join', (roomID, user) => {
        console.log('- Socket Connected! RoomID:', (roomID ? 'received' : 'not received') + ',', 'User:', user.username);
        
        socket.join(roomID);
        socket.user = user;

        // if room not in map, add it : else, add user to active members
        (!_rooms.get(roomID)) ? _rooms.set(roomID, [user.username])
                              : _rooms.get(roomID).push(user.username);
        
        // then send back messages and emit membership update event
        Room.findOne({ id: roomID })
            .then(async roomDoc => {
                socket.room = { id: roomID, name: roomDoc.name };
                await User.updateOne({ id: user.id }, { lastRoomID: roomID })
                io.sockets.in(roomID).emit('membershipUpdated', roomDoc);
            });
    });

    socket.on('newMessageServer', async (message, sender) => {
        console.log('New message received'.yellow);
        const newMessage = {
            senderID: sender.id,
            senderName: sender.username,
            senderPhoneNumber: sender.phoneNumber,
            id: MongoSchemas.generateRandIdentifier(),
            timestamp: new Date(),
            content: message
        };
        await Room.findOneAndUpdate({ id: socket.room.id }, { $push: { messages: newMessage } }, { new: true, useFindAndModify: false })
            .then(updatedRoom => io.sockets.in(socket.room.id).emit('newMessageClient', updatedRoom))
            .catch(err =>  console.error('Error saving message to room:'.red, err));
    });

    socket.on('addMember', async phoneNumber => {
        console.log('Adding member...'.yellow);
        const thisRoom = await Room.findOne({ id: socket.room.id });
        const newMember = await User.findOne({ phoneNumber });
        if (!thisRoom.members.find(member => member.id === newMember.id)) {
            await User.updateOne({ phoneNumber }, { $push: { rooms: { id: socket.room.id, name: socket.room.name } } });
            const updatedRoom = await Room.findOneAndUpdate({ id: socket.room.id }, 
                                                            { $push: { members: { username: newMember.username, id: newMember.id } } },
                                                            { new: true, useFindAndModify: false });
            console.log('Added member!'.green);
            io.sockets.in(socket.room.id).emit('membershipUpdated', updatedRoom);
        } else {
            console.error('User already in room'.red);
        }
    });

    socket.on('userTyping', () => {

    });

    socket.on('disconnect', async () => {
        let members = _rooms.get(socket.roomID);
        members && members.splice(members.indexOf(socket.user.username));
        // io.sockets.in(socket.roomID).emit('membershipUpdated', members);
    });
    
    socket.on('error', () => {

    });
    
});

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

const bodyParser = require('body-parser');
const colors = require('colors');
const path = require('path');
const cors = require('cors');
app.use(cors({origin: true}));
app.use(express.static(__dirname,+'/room'));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.post('/register/user', (req, res) => {
    console.log('- Registration request received:', req.method.cyan, req.url.underline);
    MongoQueries.registerUser(req.body.username, req.body.password)
        .then(result => result ? res.status(201).send({ userID: result.user.id, available: true }) 
                               : res.status(201).send({ available: false }));
});

app.post('/login/user', (req, res) => { 
    console.log('- Login request received:', req.method.cyan, req.url.underline);
    MongoQueries.authenticateUser(req.body.username, req.body.password)
        .then(result => res.status(200).send(result));
});

app.post('/create/room', (req, res) => {
    console.log('- Room creation request received:', req.method.cyan, req.url.underline);
    MongoQueries.createRoom(req.body.roomName, { username: req.body.username, id: req.body.userID })
        .then(room => res.status(201).send({ room }));
});

app.post('/get/user/data', (req, res) => {
    console.log('- User data request received:', req.method.cyan, req.url.underline);
    MongoQueries.getUser(req.body.userID)
        .then(data => res.status(data ? 200 : 404).send({ user: data }) && console.log('Sent user!'.green));
});

app.post('/get/room', (req, res) => {
    console.log('- Room data request received:', req.method.cyan, req.url.underline);
    MongoQueries.getRoom(req.body.id)
        .then(data => res.status(data ? 200 : 404).send({ room: data }) && console.log('Sent room!'.green));
});

app.post('/delete/all', (req, res) => {
    console.log('- Delete data request received:', req.method.cyan, req.url.underline);
    MongoQueries.deleteUsers()
        .then(() => MongoQueries.deleteRooms()
            .then(() => res.status(200).end() && console.log('Deletion complete.'.green)));
});

app.get('*', (request, response) => {   //error
    console.log('- request received:', request.method.cyan, request.url.underline);
    console.log('Error: Bad request');
    response.status(404).send('<h1>Error 404: Page Does Not Exist</h1>');
});

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

server.listen(port, () => {
    console.log('Server listening on', port.toString().yellow)
});