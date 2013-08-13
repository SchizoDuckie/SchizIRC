IRC.Server.Message = new Class({

	commandType: false,
	input: false,
	messageData: [],
	messageCode: false,
	messageContent: false,
	isServerMessage: false,
	isUserMessage: false,
	isAction: false,
	received: false,
	fromUser: '',

	initialize: function(line, hostName) {

		this.received = new Date();
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
			this.fromUser = '!SYSTEM!';
			switch(this.messageCode) {
				case 'PING':
				case 'PONG':
				case 'ERROR':
				case 'MODE':
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
				case 'JOIN':
					this.messageData[2] = this.messageData[2].substr(1);
				break;
				case 'PRIVMSG':
					console.log("PRIVATE MESSGAE!" , JSON.encode(this.messageData[3]));
					this.fromUser = this.messageData[0];
					this.toChannel = this.messageData[2];
					if(this.messageData[3] == ':'+String.fromCharCode(1)+'ACTION') {
						this.isAction = true;	
						this.messageData = Array.splice(this.messageData, 4);
					} else {
						this.messageData = Array.splice(this.messageData, 3);	
					}					
				break;
				default: 
					this.messageData = Array.splice(this.messageData, 4);
				break;
			}
		} else {
			this.isUserMessage = true;
		}
		this.messageContent = this.messageData.join(' ');
		if(this.isServerMessage && this.messageCode != 'PING' &&  this.messageContent[0] == ':' ) { 
			this.messageContent = this.messageContent.substring(1);
		}
		this.messageData = false;
		console.log("[IRC.Server.Message] " +this.messageContent);	
	},

	getContent: function() {
		return this.messageContent;
	},

	getFormattedContent: function() {
		var output = ['['+this.received.format('%H:%M')+']'];
		var user = this.fromUser.split('!')[0];
		if(this.fromUser != "!SYSTEM!") {
			output.push(this.isAction ? '* '+user : Gui.MessageDecorator.htmlEntities('<'+user+'>'));	
		}
		output.push(this.decorate(this.messageContent));
		console.log("[IRC.Server.Message] :"+this.messageCode+" for " + this.toChannel + " :" +this.messageContent+" = " +output.join(''));
		return output.join(' ');
	},

	decorate: function (msg) {
		return Gui.MessageDecorator.decorateMessage(msg);
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
		server.send('PONG '+this.messageContent.replace("PING ", ''));
	},

	startPingPong: function(server) {
		server.send("PING SCHIZIRC-PINGPONG");
	},

	PONG: function(server) {
		var chan = server.eventChannels.SEND;
		setTimeout(function() {
			window.fireEvent(chan, "PING SCHIZIRC-PINGPONG");
		}, 30000);
		
	},

	JOIN: function(server) {
		console.log("[IRC.Server.Message] Channel joined!", this.messageContent, this);
		window.fireEvent(server.eventChannels.JOIN, this.messageContent);
	},

	NAMES_LIST: function(server) {
		console.log("Received names list!", this.messageContent, this);;
		var msg = this.messageContent.split(' :');
		var chan = msg[0].substr(1);
		window.fireEvent('/channel/'+chan+'/recv_userlist', [chan, msg[1].trim().split(' ')]);
	},

	PRIVMSG: function(server) {		
		window.fireEvent('/channel/'+this.toChannel.substr(1)+'/message', [this]);
	}

})