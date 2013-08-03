IRC.ChromeConnectionAdapter = new Class({

	Implements: [Options, Events],
	Binds: ['createSocket', 'writeToSocket', 'parseData', 'onSocketData', 'onConnected', 'readLoop'],
	eventChannels: false,
	connected:false,
	dataPackage: '',
	pollTimeout: false,
	socketId: false,

	initialize: function(options, eventChannels) {
		this.setOptions(options);
		this.eventChannels = eventChannels;
	},

	connect: function() {
		console.log("[IRC.ConnectionAdapter.Chrome]: Connecting to ",this.options.server);
		if(this.connected) return; 
		this.socket = chrome.socket.create('tcp' , null, this.createSocket);
	},

	disconnect: function() {
		this.closeSocket();
		this.dataPackage = '';
	},

	send: function (data) {
	    if(this.socketId && this.connected) {
	    	this.stringToArrayBuffer(data+"\r\n", this.writeToSocket);
	    	console.log("[IRC.Connection] OUT: ", data);
	    } else {
	      this.fireEvent(this.eventChannels.LOST, ['Could not send data due to connection lost.', data]);
	    }
	},

	createSocket: function(socket) {
		console.log('[IRc.ConnectionAdapter.Crome] In CreateSocket!', socket);
		this.socketId = socket.socketId;
		chrome.socket.connect(this.socketId, this.options.server,this.options.port, this.onConnected);
	},

	onConnected: function() {
		this.connected = true;
		this.readLoop();
		this.fireEvent('connect');
	},

	closeSocket: function () {
		console.log('[IRc.ConnectionAdapter.Crome] Cosing Socket!', this.socketId);
	    if (this.connected) {
	    	chrome.socket.disconnect(this.socketId);
	    	if(this.pollTimeout) { 
	    		clearTimeout(this.pollTimeout);
	    	}
	    	this.connected = false;
	    }
	},

	writeToSocket: function(data) {
		chrome.socket.write(this.socketId, data, function() {
			// todo: handle connection errors.
		});
	},

	onSocketData: function (readInfo) {
	    var data, endLine;
	    if (!this.connected) { return; } 	   
	    
	    if (readInfo.resultCode > 0) {
	      // Convert ArrayBuffer to string.
	      this.arrayBufferToString(readInfo.data, this.parseData);
	    }	    
	},

	parseData: function(str) {
      	this.dataPackage += str;
        console.log("DataPackage received: ", this.dataPackage);
	    endLine = this.dataPackage.lastIndexOf("\r\n");
	    if(endLine > -1) {
	    	var messages = this.dataPackage.substr(0, endLine).split("\r\n"); // grab the messages that came in so far and split them by line.
	    	for(i=0; i<messages.length; i++) {
	    		window.fireEvent(this.eventChannels.DATAAVAILABLE, [new IRC.Server.Message(messages[i])]);
	    	}
	    	this.dataPackage = this.dataPackage.substr(endLine +2); // preseve the rest of the queue.
	    	messages = null;
	    }
	},

	/**
	* Checks for new data to read from the socket using poll settimeout.
	* @see http://developer.chrome.com/trunk/apps/socket.html#method-read
	*/
	readLoop: function() {
		chrome.socket.read(this.socketId, null, this.onSocketData);
		this.pollTimeout = setTimeout(this.readLoop, 500);
	},

	arrayBufferToString: function(buf, callback) {
	    var bb = new Blob([new Uint8Array(buf)]);
	    var f = new FileReader();
	    f.onload = function(e) { callback(e.target.result); };
	    f.readAsText(bb);
  	},

	stringToArrayBuffer: function(str, callback) {
	    var bb = new Blob([str]);
	    var f = new FileReader();
	    f.onload = function(e) { callback(e.target.result); };
	    f.readAsArrayBuffer(bb);
	}
});