Controller = new Class({

	gui: false,
	server: false,
	config: {
		server: 'irc.tweakers.net',
		port: '6667',
		defaultChannels: '#jongeren',
		nick: 'SchizoIRC|AdobeAir',
		userName: 'SchizoIRC',
		realName: 'SchizoIRC v0.01 in JavaScript biotch',
		appVersion: 'SchizoIRC v0.01',
		finger: 'Finger me bebeh :9 ',
		password: null, 
		logging: true
	},

	initialize: function() {

		console.log(" IRC Client initted." );
		this.irc = new IRC(this.config);
		this.gui = new Gui();
		this.gui.hookConnection(this.irc.connection.eventChannels);
		this.irc.connect();

		//setTimeout(function() {
		//	this.server.sendCommand("join" , "#jongeren", null);
		//}.bind(this), 5000);
	}
});

window.onload = function() {
	window.app = new Controller();
};

COMMAND_NUMBERS= {
	'SERVER_CONNECT' : '001',
	'RPL_YOURHOST': '002',
	'RPL_CREATED': '003',
	'SERVER_INFO' : '004',
	'MAP' : '005',
	'RPL_LUSERCLIENT': '251',
	'NUM_OPS' : '252',
	'NUM_UNKNOWN' : '253',
	'NUM_CHANNELS' : '254',
	'RPL_LUSERME': '255',
	'RPL_ADMINME': '256',	
	'RPL_LOCALUSERS' :'265',
	'RPL_GLOBALUSERS': '266',
	'RPL_ADMINEMAIL': '259',
	'NAMES_LIST' : '353',
	'NAMES_LIST_END' : '366',
	'TOPIC' : '332',
	'TOPIC_INFO' : '333',
	'NICK_AWAY' : '301',
	'NICK_LOOKS_VERY_HELPFUL' : '310',
	'NICK_USER_INFO' : '311',
	'NICK_USER_INFO2' : '314',
	'NICK_SERVER_INFO' : '312',
	'NICK_IS_IRCOP' : '313',
	'END_OF_WHO' : '315',
	'NICK_SECONDS_SIGNON' : '317',
	'END_OF_WHOIS' : '318',
	'NICK_CANNELS' : '319',
	'NICK_SIGNED_ON_AS' : '320',
	'CHANNEL_INFO' : '322',
	'WHO' : '352',
	'END_OF_WHO_WAS' : '369',
	"RPL_MOTD" : "372",
	'RPL_MOTDSTART': '375',
	"RPL_ENDOFMOTD" : "376",	
	'HOST_CHANGE' : '396',
	'CANNOT_SEND_TO_CHANNEL' : '404',
	'NICK_IS_ALREADY_IN_USE' : '433',
	"INVALID_PASSWORD" : "464",	
	"NOTICE" : "NOTICE" ,
	"ERROR" : "ERROR",
	"PING" : "PING",
	"PONG" : "PONG",
	"JOIN" : "JOIN",
};

EVENT_CHANNELS = {
	'CHANNEL_JOIN' : '/channel/join',
	'CONNECTION_DESTROY' : '/connection/destroy'
};