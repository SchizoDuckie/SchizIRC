IRC.Connection = new Class({

	Implements: [Options, Events],
	Binds: ['onConnect', 'send', 'disconnected','connectionError','destroy'],
	
	autoPing: true,
	pingTimeout: 60000,
	connected: false,
	
	autoReconnect: true,

	adapter: false,
	eventChannels : { /* The mapping for individual event channels for this connection. */
		AVAILABLE : false,
		LOST: false,
		ERROR: false,
		DATAAVAILABLE: false,
		SEND: false,
		CLOSE: false,
		JOIN: false,
		PART: false,
	},

	initialize: function(options) {
		this.setOptions(options);
		
		this.eventChannels.AVAILABLE = '/connection/'+options.server+'/available';
		this.eventChannels.LOST = '/connection/'+options.server+'/lost';
		this.eventChannels.ERROR = '/connection/'+options.server+'/error';
		this.eventChannels.DATAAVAILABLE = '/connection/'+options.server+'/data';
		this.eventChannels.SEND = '/connection/'+options.server+'/send';
		this.eventChannels.CLOSE = '/connection/'+options.server+'/close';
		this.eventChannels.JOIN = '/connection/'+options.server+'/join';
		this.eventChannels.PART = '/connection/'+options.server+'/part';
		
		document.addEvent(this.eventChannels.LOST, this.disconnected);
		document.addEvent(this.eventChannels.ERROR, this.connectionError);
		document.addEvent(this.eventChannels.SEND, this.send);
		document.addEvent(EVENT_CHANNELS.CONNECTION_DESTROY, this.destroy);
		this.determineAdapter();
	},

	determineAdapter: function() {
		if('chrome' in window && 'socket' in chrome) {
			this.adapter = new IRC.ChromeConnectionAdapter(this.options, this.eventChannels);
		}
		if('air' in window && 'Socket' in air) {
			this.adapter = new IRC.AirConnectionAdapter(this.options, this.eventChannels);	
		} 
		if(!this.adapter) {
			//throw ("Could not determine connection adapter. Make sure you either run this as a Chrome app or in Adobe Air");
		} else {
			this.adapter.addEvent('connect', this.onConnect);
		}
	},

	connect: function() {
		console.log("[IRC.Connection]: Connecting to ",this.options.server);
		if(this.connected) return; 
		this.adapter.connect();
	},

	autoReconnect: function() {
		console.log("Connection lost, auto reconnecting.[TODO]");
	},

	onConnect: function () {
		console.log("[IRC.Connection] Connected!");
		if(!this.server) {
			this.server = new IRC.Server(this.options, this.eventChannels);
		}
	    this.connected = true;
	},

	send: function (data) {
	   this.adapter.send(data);
	},

	disconnect: function() {
		this.adapter.disconnect();
	},

	destroy: function (data) {
	    this.disconnect();
	    this.adapter.destroy();
	    this.adapter = null;
	    this.determineAdapter();
	    console.log("[IRC.Connection] IRC Connection Destroyed");
	},

	disconnected: function() {
	    this.established = false;
	    this.connected = false;
	    console.log("[IRC.Connection] Disconnected from server.", this.options.server);
	    document.fireEvent('/connection/'+this.options.server+'/lost', [" Disconnected from server."+ this.options.server])
	}

});