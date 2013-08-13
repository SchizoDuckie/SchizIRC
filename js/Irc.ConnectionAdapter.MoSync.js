IRC.AirConnectionAdapter = new Class({

	Implements: [Options, Events],
	Binds: ['onConnected', 'onSocketStatus', 'onSocketData', 'createSocket'],
	eventChannels: false,

	connected:false,
	dataPackage: '',
	monitor: false,
	autoReconnect: true,



	initialize: function(options, eventChannels) {
		this.setOptions(options);
		this.eventChannels = eventChannels;
		
		window.addEvent(this.eventChannels.AVAILABLE, this.createSocket);
	},
	
	connect: function() {
		if(!this.monitor) {
			this.monitor = new air.SocketMonitor(this.options.server, this.options.port);
	    	this.monitor.addEventListener(air.StatusEvent.STATUS, this.onSocketStatus);
		}
  		if(!this.socket) {
		  	this.socket = new air.Socket();
		    this.socket.addEventListener(air.Event.CONNECT, this.onConnected);
		    this.socket.addEventListener(air.ProgressEvent.SOCKET_DATA, this.onSocketData);		
  		}
    	this.monitor.start();
    },

    disconnect: function() {
		this.closeSocket();
		this.dataPackage = '';
	},

	send: function(data) {
	 if(this.socket && this.socket.connected) {
	      this.socket.writeUTFBytes(data+"\r\n");
	      this.socket.flush();
	      console.log("[IRC.Connection] OUT: ", data);
	    } else {
	      this.fireEvent(this.eventChannels.LOST, ['Could not send data due to connection lost.', data]);
	    }
	},

	createSocket: function() {
		console.log('in createSOcket');
		if(this.monitor.available) {
			console.log("Socket status avaialble, connecting socket.");
			this.socket.connect(this.options.server, this.options.port);
		}
	},

	onConnected: function() {
		this.connected = true;
		this.fireEvent('connect');
	},

	closeSocket: function () {
		console.log("[IRC.Connection] Closing socket.");
	    if (this.socket && this.socket.connected) {
	         this.socket.close();
	    }
	    if (this.monitor && this.monitor.running) {
	      this.monitor.stop();
	    }
	    this.socket = false;
	    this.socketMonitor = false;
	    this.connected = false;
	},

    onSocketData: function () {
	    var data, endLine;
	    if (!this.connected) { return; } 

	    this.dataPackage += this.socket.readUTFBytes(this.socket.bytesAvailable);
	    this.parseData();
	    if (this.socket && this.socket.connected) {
	      this.socket.flush();
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
	}

});