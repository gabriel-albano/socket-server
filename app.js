const express = require('express')
  , app = express()
  , http = require('http').Server(app)
  , io = require('socket.io')(http);

http.listen(8080, function(){
  console.log('listening on 8080');
});

// routing
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {

  console.info('Socket ' + socket.id + ' has connected');

	// when the client emits 'addclient', this listens and executes
	socket.on('addclient', function(clientId, groupId){

    console.info("message to addclient");

    // store the clientId and groupId in the socket session for this client
    socket.clientId = clientId; // Device ID
    socket.groupId = groupId; // Ord ID

    // Add to Common room
    add2Room(socket, 'general', clientId).then(function() {
      // Add to Org Room
      return add2Room(socket, groupId, clientId);
    }).then(function() {
      // Add to Device Room
      return add2Room(socket, clientId, clientId);
    }).catch(function(err) {
      console.error(err)
    });

	});
	
	// when the client emits 'update', this listens and executes
	socket.on('update', function (data) {
		// forward the to the Group
		io.in(socket.groupId).emit('update', socket.clientId, data);
		// Forward the message to the Device
    io.in(socket.clientId).emit('update', socket.clientId, data);
    // Update database here if neded
	});

	socket.on('getRooms', function () {
    socket.emit('rooms', io.sockets.adapter.rooms);
  });

	socket.on('ping', function() {

    console.info("message to ping");

    // forward the to the Group
    io.in(socket.groupId).emit('ping', "Group: from " + socket.clientId);
    // Forward the message to the Device
    io.in(socket.clientId).emit('ping', "Client: from " + socket.clientId);
  });

	// when the user disconnects.. perform this
	socket.on('disco', function(){

	  console.info("message to disconnect");

    remove4Room(socket, 'general', socket.clientId).then(function() {
      return remove4Room(socket, socket.groupId, socket.clientId);
    }).then(function() {
      return remove4Room(socket, socket.clientId, socket.clientId);
    }).catch(function(err) {
      console.error(err)
    });
	});
	
	const add2Room = function(socket, roomName, clientId) {
    return new Promise(function (fulfill, reject) {
      try {
        // add  client to room
        socket.join(roomName);
        // echo to client they've connected
        socket.emit('HELO', 'you have connected to ' + roomName);
        // echo to room that a client has connected to their room
        socket.broadcast.to(roomName).emit('update', 'SERVER', clientId + ' has connected to '+ roomName);

        console.log(clientId + ' has connected to ' + roomName);

        fulfill();
      } catch (ex) {
        // console.error(ex);
        reject(ex);
      }
    });
  };

  const remove4Room = function(socket, roomName, clientId) {
    return new Promise(function (fulfill, reject) {
      try {
        // remove client to room
        socket.leave(roomName);
        // echo to client they've connected
        socket.emit('disconnected', 'SERVER', 'you have disconnected from ' + roomName);
        // echo to room that a client has connected to their room
        socket.broadcast.to(roomName).emit('update', 'SERVER', clientId + ' has disconnected from ' + roomName);
        console.log(clientId + ' has disconnected from ' + roomName);
        fulfill();
      } catch (ex) {
        // console.error(ex);
        reject(ex);
      }
    });
  }

});
