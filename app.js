var socket = require('socket.io'),
	express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = socket.listen(server);

io.sockets.on('connection', function(client){
	console.log("Player connected...");

	client.on('move', function(data){
		console.log(data);
		client.broadcast.emit('othermove', data);
	});
});

server.listen(8080);