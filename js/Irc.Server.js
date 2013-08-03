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
		document.addEvent(eventChannels.DATAAVAILABLE, this.onData);
		document.addEvent('/user/input', this.onUserCommand);
		document.addEvent(eventChannels.JOIN, this.joinChannel);
		if (this.options.password) {
			this.send('PASS '+this.password);
		}
		this.send("NICK " + this.options.nick);
		this.send("USER " + this.options.userName + " " + this.options.server + " " + this.options.hostName+ " "   + this.options.realName);		
	},

	onUserCommand: function(data) {
		if(data[0] == '/') {
			cmd = data.substring(1).split(' ')[0];
			console.log("Command detected: ", cmd);
			if(this.commands.isValid(cmd)) {
				console.log("Valid command detected: ", cmd.toUpperCase(), ' arguments : ', data.substr(2 + cmd.length));
				this.commands[cmd.toUpperCase()](data.substr(2 + cmd.length));
			} 
		} else {
			this.sendPM(this.getActiveChannel(), data);
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
		document.fireEvent(this.eventChannels.SEND, data);
	},

	sendPM: function (target, msg) {
	    this.send(["PRIVMSG", target, ":" + msg].join (" "));
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
		document.fireEvent(this.eventChannels.CLOSE, message);
	},

	onData: function(message) {
		console.log("[IRC.Server] data received for " + this.options.server, message.getContent(), message);
		message.handle(this);
	},
	 
	handleJoin: function (nick, host, target) {
		var channelName, _nick, user, channel, msg;
		//add nick to connection users
		if (!nick || !target) { return; }
		channelName = this.getChannelName(target);
		_nick = this.getNick();
		if (nick === _nick) {
		  console.log("JOINING CHANNEL: " + target);
		  if (this.channels[channelName]) {
		    this.channels[channelName].destroy();
		    delete this.channels[channelName];
		  }
		  this.channels[channelName] = new Channel(target, this.CHANNEL_TYPES.CHANNEL, this.server, this.logPref, this.getConnectionId());
		  this.client.getTopic(target);
		  fireEvent(EventChannels.CHANNELS_CHANGED, ["join", channelName, this.server, null, this.getConnectionId()]);
		  if (channelName in this.names) {
		    this.addNamesToChannel(channelName, this.names[channelName]);
		  } else {
		    this.client.sendNames(target);
		  }
		}
		user = this.getUser(nick);
		if (!user) {
		  user = new User(nick, host);
		  this.users[nick] = user;
		}
		//add nick to channel
		if (channelName in this.channels) {
		  channel = this.channels[channelName];
		  channel.addUser(user);
		  channel.publishUserActivity();
		}
		msg = new ActivityItem("join", nick, target, null, user, host);
		this.addActivityToChannel(target, msg);
	},


});