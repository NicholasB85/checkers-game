var socket = require('socket.io'),
	express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = socket.listen(server);

var games = [];

io.sockets.on('connection', function(client) {
	if (games.length === 0 || games[games.length - 1].p2) {
		games.push({
			p1: client,
			p2: null
		});
		client.emit('start', {color: 'white', number: games.length});
	} else {
		games[games.length - 1].p2 = client;
		client.emit('start', {color: 'black', number: games.length});
	}


	console.log("Player connected...");

	client.on('move', function(data, number) {
		getOtherPlayer(client, number).emit('othermove', data);
	});

	client.on('remove', function(data, number) {
		getOtherPlayer(client, number).emit('otherremove', data);
	});

	client.on('turnKing', function(data, number) {
		getOtherPlayer(client, number).emit('otherTurnKing', data);
	});

	client.on('turn', function(number) {
		getOtherPlayer(client, number).emit('otherTurn');
	});
});

function getOtherPlayer(client, number){
	return games[number - 1].p1 === client ? games[number - 1].p2 : games[number - 1].p1;
}

server.listen(8080);