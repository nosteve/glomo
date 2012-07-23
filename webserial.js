var SerialPort = require('serialport').SerialPort;
var websock = require('websock');
var connect = require('connect');
var comm = new Array();
var rdy = true;
var id = 0;
var sockets = [];
var incoming = "";
var incoming_mode = false;
var argv = process.argv;

if (!argv[2]) {
    console.log("Usage:\n node webserial.js serial_port [listen_ip] [websocket_port] [http_port]\n\n");
    process.exit();
}

var serialPort = new SerialPort(argv[2]);

function sleep(ms) {
  var startTime = Date.now();
  while (Date.now() < startTime + ms);
}

connect.createServer(
    connect.static(__dirname)
).listen(argv[5] || 8082);

websock.listen(argv[4] || 8081, function(socket) {
  /* This doesn't work for some reason, do it on first message instead :P
  socket.on("open", function() {
    //Assign unique identifier
    console.log("new connect");
    socket.ident = id++;
    sockets[socket.ident] = socket;
  });
  */
  socket.on('message', function(message) {
    //console.log(message);
    //Assign unique identifier
    if (!socket.ident) {
        socket.ident = id++;
        sockets[socket.ident] = socket;
        //console.log("new connect " + socket.ident);
    }
    if (message.slice(0,2) == "S:") {
        //console.log("server msg");
        //need to send message to other connected ones
        for (var i = 0; i < sockets.length; i++) {
            //sparse array
            if (!sockets[i]) continue;
            //don't send to yourself
            if (i != socket.ident) { 
                sockets[i].send(message);
                //console.log("sending to " + i); 
            }
        }
    }
    else {
        comm.push(message);
        writeser();
    }
  });
  socket.on('close', function() {
    delete sockets[socket.ident];
    console.log("closed");
  });
});

var sersocket = websock.connect("ws://" + (argv[3] || "127.0.0.1") + ":" + (argv[4] || "8081"), {protocol:8});

serialPort.on("data", function (data) {
    //console.log("recv" + data);
    var command = "";
    var d = data.toString();
    var a = d.split("Y");
    var b = d.split("Z");
    if (a.length > 1) {
        //incoming command spotted
        incoming_mode = true;
        rdy = false;
        for (var i=1; i < a.length; i++) {
            incoming += a[i];
        }
        var z = a[a.length - 1].split("Z");
        if (z.length > 1) {
            //end of incoming
            incoming += z[0];
            command = incoming;
            incoming = "";
            incoming_mode = false;
            rdy = true;
            writeser();
        }
    }
    else if (b.length > 1) {
        if (incoming_mode == true) {
            incoming += b[0];
            command = incoming;
            incoming = "";
            incoming_mode = false;
            rdy = true;
            writeser();
        }
        else {
            rdy = true;
            writeser();
        }
    }
    else {
        if (incoming_mode == true) {
            incoming += d;
        }
    }
    if (command != "") {
        var c = command.split("\n");
        for (var i=0; i < c.length; i++) {
            sersocket.send("S:" + c[i]);
            console.log("command: " + command);
        }
        command = "";   
    }
});

function writeser() {
    if (rdy == true) {
        if (comm.length > 0) {
            serialPort.write(comm.pop());
            rdy = false;
        }
    }
}

