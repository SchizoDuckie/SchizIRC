IRC.Connection = new Class({

	Implements: [Options, Events],
	Binds: ['onStatus', 'onConnect', 'createSocket','onSocketStatus','onSocketData', 'autoReconnect','connectionError','destroy','send', '_periodicallyRead'],
	monitor: false,
	socket: false,
	autoPing: true,
	pingTimeout: 60000,
	connected: false,
	established: false,
	accepted: false,
	ctcpTimeout: 5000,
	autoReconnect: true,
	dataPackage: '',
	eventChannels : { /* The mapping for individual event channels for this connection. */
		AVAILABLE : false,
		LOST: false,
		ERROR: false,
		DATAAVAILABLE: false,
		SEND: false,
		CLOSE: false
	},

	initialize: function(options) {
		this.setOptions(options);
		
		this.eventChannels.AVAILABLE = '/connection/'+options.server+'/available';
		this.eventChannels.LOST = '/connection/'+options.server+'/lost';
		this.eventChannels.ERROR = '/connection/'+options.server+'/error';
		this.eventChannels.DATAAVAILABLE = '/connection/'+options.server+'/data';
		this.eventChannels.SEND = '/connection/'+options.server+'/send';
		this.eventChannels.CLOSE = '/connection/'+options.server+'/close';

		window.addEvent(this.eventChannels.AVAILABLE, this.createSocket);
		window.addEvent(this.eventChannels.LOST, this.disconnected);
		window.addEvent(this.eventChannels.ERROR, this.connectionError);
		window.addEvent(this.eventChannels.SEND, this.send);
		window.addEvent(EVENT_CHANNELS.CONNECTION_DESTROY, this.destroy);
	},

	connect: function() {
		console.log("[IRC.Connection]: Connecting to ",this.options.server);
		if(this.connected) return; 

		var chan = this.eventChannels.AVAILABLE;
		this.socket = chrome.socket.create('tcp' , null, function(sockInfo) {
				console.log("Chrome socket created: ", sockInfo);
				window.fireEvent(chan, sockInfo);
		});
	},

	createSocket: function(socket) {
		console.log('In CreateSocket!', socket);
		this.socketId = socket.socketId;
		chrome.socket.connect(this.socketId, this.options.server,this.options.port, this.onConnect.bind(this));
	},

	onSocketStatus: function(evt) {
		console.log("[IRC.Connection] Socket status changed: " , evt);
		var status = this.monitor.available;
	    if (status && this.autoReconnect && !this.connected) {
	 	  window.fireEvent(this.eventChannels.AVAILABLE);
	    } else if (!status && this.stayConnected && this._isConnected) {
	      window.fireEvent(this.eventChannels.LOST);
	    } else if (!status && this.stayConnected) {
	      window.fireEvent(this.eventChannels.ERROR, [evt]);
	    }
	},

	autoReconnect: function() {
		console.log("Connection lost, auto reconnecting.[TODO]");
	},

	onConnect: function (socket) {
		console.log("[IRC.Connection] Connected!", socket);
		if(!this.server) {
			this.server = new IRC.Server(this.options, this.eventChannels);
			this._periodicallyRead();
		}
	    this.connected = true;
	},

	/**
	* Checks for new data to read from the socket
	* @see http://developer.chrome.com/trunk/apps/socket.html#method-read
	*/
	_periodicallyRead: function() {
		chrome.socket.read(this.socketId, null, this.onSocketData);
		setTimeout(this._periodicallyRead, 500);
	},

	send: function (data) {
	    if(this.socketId) {
	    	var id = this.socketId;
	    	this.stringToArrayBuffer(data+"\r\n", function(data) {
	    		chrome.socket.write(id, data, function() {});	
			}.bind(this));
	      console.log("[IRC.Connection] OUT: ", data);
	    } else {
	      this.fireEvent(this.eventChannels.LOST, ['Could not send data due to connection lost.', data]);
	    }
	},

	arrayBufferToString: function(buf, callback) {
	    var bb = new Blob([new Uint8Array(buf)]);
	    var f = new FileReader();
	    f.onload = function(e) {
	      callback(e.target.result);
	    };
	    f.readAsText(bb);
  	},


	stringToArrayBuffer: function(str, callback) {
	    var bb = new Blob([str]);
	    var f = new FileReader();
	    f.onload = function(e) {
	        callback(e.target.result);
	    };
	    f.readAsArrayBuffer(bb);
	},

	onSocketData: function (readInfo) {
	    var data, endLine;
	    if (!this.connected) { return; } 	   
	    
	    if (readInfo.resultCode > 0) {
	      // Convert ArrayBuffer to string.
	      this.arrayBufferToString(readInfo.data, function(str) {
	      	this.dataPackage += str;
	        console.log("DataPackage received: ", this.dataPackage);
		    endLine = this.dataPackage.lastIndexOf("\r\n");
		    if(endLine > -1) {
		    	var messages = this.dataPackage.substr(0, endLine).split("\r\n"); // grab the messages that came in so far and split them by line.
		    	for(i=0; i<messages.length; i++) {
		    		window.fireEvent(this.eventChannels.DATAAVAILABLE, [new IRC.Server.Message(messages[i])]);
		    	}
		    	this.dataPackage = this.dataPackage.substr(endLine +2); // preseve the rest of the queue.
		    }
	      }.bind(this));
	    }	    
	},

	closeSocket: function () {
		console.log("[IRC.Connection] Closing socket.");
	    if (this.socket && this.socket.connected) {
	         this.socket.close();
	    }
	    if (this.monitor && this.monitor.running) {
	      this.monitor.stop();
	    }
	},

	closeConnection: function (msg) {
		msg = msg || 'Connection closed.';
	    this.stayConnected = false;
	    this.connected = false;
	    this.established = false;
	    this.accepted = false;
	    this.closeSocket();
	    window.fireEvent('/connection/'+this.options.server+'/quit', ['Quit: '+msg]);
	},

	destroy: function (data) {
	    this.closeConnection();
	    this.socket = false;
	    this.socketMonitor = false;
	    console.log("[IRC.Connection] IRC Connection Destroyed");
	},

	disconnected: function() {
	    this.dataPackage = '';
	    this.established = false;
	    this.eccepted = false;
	    this.connected = false;
	    console.log("[IRC.Connection] Disconnected from server.", this.options.server);
	    window.fireEvent('/connection/'+this.options.server+'/disconnected', [" Disconnected from server."+ this.options.server])
	 }

});