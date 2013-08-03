IRC.Server.Message = new Class({

	commandType: false,
	input: false,
	messageData: [],
	messageCode: false,
	messageContent: false,
	isServerMessage: false,
	isUserMessage: false,

	initialize: function(line, hostName) {
		if(line[0] ==':') line = line.substring(1);
		this.hostName = hostName;
		this.messageData = line.split(" ");
		this.isServerMessage = (this.messageData[0] == hostName);
		if(Object.keyOf(COMMAND_NUMBERS, this.messageData[1]) != null) {
			this.commandType = Object.keyOf(COMMAND_NUMBERS, this.messageData[1]);
			this.isServerMessage = true;
			this.messageCode = this.messageData[1];
		} 
		else if(Object.keyOf(COMMAND_NUMBERS, this.messageData[0]) != null) {
			this.commandType = Object.keyOf(COMMAND_NUMBERS, this.messageData[0]);
			this.isServerMessage = true;
			this.messageCode = this.messageData[0];
		}
		if(this.isServerMessage) {
			switch(this.messageCode) {
				case 'PING':
				case 'PONG':
				case 'ERROR':
					this.messageData = Array.splice(this.messageData, 1);
				break;
				case 'NOTICE':
					this.messageData = Array.splice(this.messageData, 2);
				break;
				case '001':
				case '002':
				case '251':
				case '252':
				case '254':
				case '255' :
					this.messageData = Array.splice(this.messageData, 3);
				break;
				default: 
					this.messageData = Array.splice(this.messageData, 4);
				break;
			}
		} else {
			this.isUserMessage = true;

		}
		this.messageContent = this.messageData.join(' ').trim();
		if(this.isServerMessage && this.messageCode != 'PING' &&  this.messageContent[0] == ':' ) { 
			this.messageContent = this.messageContent.substring(1);
		}
		this.messageData = false;
		console.log("[IRC.Server.Message] " +this.messageContent);	
	},

	getContent: function() {
		return this.messageContent;
	},

	/**
	 * Handle this message type for the server
	 * Checks if the function exists in the message class and performs any actions that need to be done for it.
	 * @param server the Server instance that handles this message.
	 */
	handle: function(server) {
		if(this.commandType in this) {
			this[this.commandType](server);
		}		
	},

	SERVER_CONNECT: function(server) {
		console.log("[IRC.Server.Message] Connected starting ping service.!");
		this.startPingPong(server);
		
	},

	ERROR: function(server) {
		console.log("[IRC.Server.Message] Message contains an error!", this.messageContent);
		server.disconnect(this.messageContent);
	},

	PING: function(server) {
		console.log("PING Received! sending PONG!");
		server.send('PONG '+this.messageContent.replace("PING ", ''));
	},

	startPingPong: function(server) {
		server.send("PING SCHIZIRC-PINGPONG");
	},

	PONG: function(server) {
		console.log("PONG Received! sending new Ping in 30s!");
		var chan = server.eventChannels.SEND;
		setTimeout(function() {
			document.fireEvent(chan, "PING SCHIZIRC-PINGPONG");
		}, 30000);
		
	}

})