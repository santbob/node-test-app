
/**
 * Module dependencies.
 */

var express = require('express');

var server = module.exports = express.createServer();

var io = require('socket.io').listen(server);

// Configuration

server.configure(function(){
  server.set('views', __dirname + '/views');
  server.set('view engine', 'jade');
  server.use(express.bodyParser());
  server.use(express.methodOverride());
  server.use(server.router);
  server.use(express.static(__dirname + '/resources'));
});

server.configure('development', function(){
  server.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

server.configure('production', function(){
  server.use(express.errorHandler()); 
});

// Routes

server.get('/', function(req, res){
  res.render('home', {
    locals: {
      title: 'Express'
    }
  });
});

server.listen(4000);
var buffer = [];
io.sockets.on('connection', function (socket) {
        socket.json.send({buffer: buffer});
        socket.broadcast.emit('message',{announcement: socket.id + ' connected' });
        socket.on('message', function(message){
                console.log("message from client "+message);
                var msg = { message: [socket.id, message] };
                buffer.push(msg);
                if (buffer.length > 15) buffer.shift();
                socket.broadcast.emit('message',msg);
        });

        socket.on('disconnect', function(){
                socket.broadcast.emit('message',{ announcement: socket.id + ' disconnected' });
        });
});

console.log("Express server listening on port %d", server.address().port)
