const express = require('express');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
let users = [];
//New imports
const http = require('http').Server(app);
const cors = require('cors');

app.use(cors());

app.get('/', (req, res) => {
    res.json({
        message: 'Your Backend Server Successfully Deployed...',
    });
});     


const socketIO = require('socket.io')(http, {
    cors: {
        origin: "*"
    }
});

//Add this before the app.get() block
socketIO.on('connection', (socket) => {
    console.log(`${socket.id} user just connected!`);

    socket.on('message', (data) => {
        // Create a Date object
        const currentDate = new Date();
        // Get the current time
        const currentTime = currentDate.toLocaleTimeString();
        // Print the current time
        data.time=currentTime;
        console.log(data)        
        console.log('Current time:', currentTime);
        socketIO.emit('messageResponse', data);
    });

    //Listens when a new user joins the server
    socket.on('newUser', (data) => {
        //Adds the new user to the list of users
        users.push(data);
        // console.log(users);
        //Sends the list of users to the client
        socketIO.emit('newUserResponse', users);
    });

    socket.on('typing', (data) => socket.broadcast.emit('typingResponse', data));

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        //Updates the list of users when a user disconnects from the server
        users = users.filter((user) => user.socketID !== socket.id);
        // console.log(users);
        //Sends the list of users to the client
        socketIO.emit('newUserResponse', users);
        socket.disconnect();
    });
});

http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});