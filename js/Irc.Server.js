IRC.Server = new Class({

	Implements: [Options, Events],

	Binds: ['onData', 'onUserCommand','setActiveChannel','joinChannel'],
	eventChannels: false,
	host: false,
	ping: {
		lastSent: false,
		lastReceived: false,
		time: false
	},
	commands: false,
	activeChannel: false,
	channels: {},

	initialize: function(options, eventChannels) {
		this.setOptions(options);
		this.eventChannels = eventChannels;
		this.commands = new IRC.Commands(this);

		console.log("[IRC.SERVER] New Server connection created. handling input");
		window.addEvent(eventChannels.DATAAVAILABLE, this.onData);
		window.addEvent('/user/input', this.onUserCommand);
		window.addEvent(eventChannels.JOIN, this.joinChannel);
		if (this.options.password) {
			this.send('PASS '+this.password);
		}
		this.commands.NICK(this.options.nick);
		this.commands.USER(this.options.userName + " " + this.options.server + " " + this.options.hostName+ " "   + this.options.realName);		
	},

	onUserCommand: function(data, channel) {
		if(data[0] == '/') {
			cmd = data.substring(1).split(' ')[0];
			console.log("Command detected: ", cmd);
			if(this.commands.isValid(cmd)) {
				console.log("Valid command detected: ", cmd.toUpperCase(), ' arguments : ', data.substr(2 + cmd.length));
				this.commands[cmd.toUpperCase()](data.substr(2 + cmd.length));
			} 
		} else {
			this.sendPM(channel || this.getActiveChannel(), data);
		}
	},

	getActiveChannel: function() {
		return this.activeChannel;
	},

	setActiveChannel: function(chan) {
		if(this.commands.isChannelName(chan)) {
			console.info("[IRC.Server.js] --> Set active channel to! " , chan);
			this.activeChannel = chan;
			if(!this.channels[chan]) {
				console.log("[IRC.Server.js] Creating New IRC.Channel" , chan);
				this.channels[chan] = new IRC.Channel(chan);
			}
		}
	},

	joinChannel: function(message) {
		console.log("----> CHANNELS WAS JOINED! " , message);
		var chan = message.split(' ')[2];
		this.setActiveChannel(chan);
	},

	send: function(data) {
		window.fireEvent(this.eventChannels.SEND, data);
		
	},

	sendPM: function (target, msg) {
	    this.send(["PRIVMSG", target, ":" + msg].join (" "));
	    window.fireEvent('/channel/'+target.substring(1)+'/message',
	     new IRC.Server.Message(this.options.nick+'!'+this.options.userName+'@'+this.options.hostName+' PRIVMSG '+target+' :'+msg, this.host));
	},


	sendAction: function (target, msg) {
	    this.sendCTCP(target, ["ACTION", msg].join(" "));
  	},

  	sendNotice: function (target, msg) {
	    this.send(["NOTICE", target, ":" + msg].join(" "));
  	},

	sendCTCP: function (target, msg) {
		var token, parts, cmd;
		token = String.fromCharCode(1);
		if (msg) {
		  parts = msg.split(" ");
		  if (parts && parts.length) {
		    cmd = parts.shift();
		    msg = parts.join(" ");
		    this.sendPM(target, [token, cmd.toUpperCase(), " ", msg, token].join(""));
		  }
		}
	},

	disconnect: function(message) {
		console.log('IRC.Server Disconnect ', message);
		window.fireEvent(this.eventChannels.CLOSE, message);
	},

	onData: function(message) {
		console.log("[IRC.Server] data received for " + this.options.server, message.getContent(), message);
		message.handle(this);
	}

});