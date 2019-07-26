require("color");
const bcrypt = require("bcryptjs");
const MongoSchemas = require("./MongoSchemas.js");
const User = MongoSchemas.User;
const Room = MongoSchemas.Room;

const authenticateUser = async (username, password) => {
  let result;
  await User.findOne({ username })
    .then(data => {
      if (data && bcrypt.compareSync(password, data.password)) {
        console.log("Authentication successful!".green);
        result = { userID: data.id };
      }
    })
    .catch(err =>
      console.error("Error finding user for authentication".red, err)
    );
  return result;
};

const registerUser = async (username, password) => {
  let result;
  let data = await User.findOne({ username }).catch(err =>
    console.error("Error searching for duplicate user:".red, err)
  );
  if (data) console.log("Found user of same name".magenta);
  else {
    let newUser = await createUser(username, password);
    console.log("User registered! Hooray! \u{1F389} \u{1F389} \u{1F389}".green);
    result = { user: newUser };
  }
  return result;
};

const createUser = async (username, password) => {
  console.log("Attempting to make new user...".yellow);
  let id = bcrypt.hashSync(MongoSchemas.generateRandIdentifier(), 10),
    firstRoom = await genFirstRoom({ username, id }),
    phoneNumber = await genPhoneNumber(),
    newUser = new User({
      username,
      password: bcrypt.hashSync(password, 10),
      id,
      phoneNumber,
      rooms: [
        {
          id: firstRoom.id,
          name: firstRoom.name
        }
      ],
      lastRoomID: firstRoom.id
    });
  await newUser
    .save()
    .then(() => console.log("Created a new user!".green))
    .catch(err => console.error("Error saving User document:".red, err));
  return newUser;
};

const genPhoneNumber = async () => {
  let allUsers = await User.find({});
  allNumbers = allUsers.reduce((acc, user) => acc.concat(user.phoneNumber), []);

  const nums = "1234567890";
  let result,
    uniqueNumber = false;

  while (!uniqueNumber) {
    (result = ""), (uniqueNumber = true);
    for (let i = 0; i < 10; i++)
      result += nums[Math.floor(Math.random() * nums.length)];
    allNumbers.forEach(number => {
      if (number === result) uniqueNumber = false;
    });
  }

  return result;
};

const getUser = async id => {
  let user;
  await User.findOne({ id })
    .then(data => {
      data
        ? console.log("User located. Sending data...".green)
        : console.error("User not found.".red);
      user = data;
    })
    .catch(err => console.error("Error getting user data".red, err));
  return user;
};

// new room object is defined, it is added to user's rooms and returned
// [X] room here refers to just the identifying info of a room, the actual room data (messages, members) is stored on the server
// nah changed mind about above line
const createRoom = async (name, user) => {
  console.log("Creating new room...".yellow);
  const newRoom = new Room({
    name,
    id: bcrypt.hashSync(MongoSchemas.generateRandIdentifier(), 10),
    messages: [],
    members: [user] // user ID and username
  });
  await newRoom.save();
  await User.updateOne(
    { id: user.id },
    { $push: { rooms: { name: newRoom.name, id: newRoom.id } } }
  )
    .then(() => console.log("Created new room!".green))
    .catch(err => console.error("Error adding room:".red, err));
  return newRoom;
};

const genFirstRoom = async user => {
  console.log("Generating first room...".yellow);
  const firstRoom = new Room({
    name: "Hello World",
    id: bcrypt.hashSync(MongoSchemas.generateRandIdentifier(), 10),
    members: [user],
    messages: [
      {
        senderName: "Griffin",
        senderID: "12345",
        senderPhoneNumber: "1234567890",
        id: bcrypt.hashSync(MongoSchemas.generateRandIdentifier(), 10),
        timestamp: new Date(),
        content: "Hi there!"
      }
    ]
  });
  await firstRoom
    .save()
    .then(() => console.log("Created first room for new user!".green))
    .catch(err =>
      console.error("Error creating first Room document for new user:".red, err)
    );
  return firstRoom;
};

const getRoom = async id => {
  let room;
  await Room.findOne({ id })
    .then(data => {
      data
        ? console.log("Room located. Sending data...".green)
        : console.error("Room not found.".red);
      room = data;
    })
    .catch(err => console.error("Error getting room data".red, err));
  return room;
};

module.exports = {
  authenticateUser,

  registerUser,

  createUser,

  getUser,

  createRoom,

  genFirstRoom,

  getRoom,

  deleteUsers: () => User.deleteMany({}).exec(),

  deleteRooms: () => Room.deleteMany({}).exec()
};
