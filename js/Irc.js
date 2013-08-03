IRC = new Class({
	Implements: [Options, Events],

	options: {
		server: 'irc.tweakers.net',
		port: 6667,
 		host: 'localhost',
 		password: false,
 		nick: 'SchizoIRC',
 		userName: 'SchizoIRC',
 		realName: 'SchizoIRC v0.2',
 		finger: 'Oh yeah, handle me like one of your french maids bebeh!',
 		autoJoinChannels: '#botjestest',
 		autoJoinOnInvite: true
 	},

 	connection: false,
 	server: false,
 	channels: false,

 	initialize: function(options) {
 		this.setOptions(options, this.options);
		if(!this.connection) {
 			this.connection = new IRC.Connection(this.options);
 		}
 	},

 	connect: function() {
 		this.connection.connect();
 	},

 	disconnect: function() {
 		this.connection.disconnect();
 	}

 });
