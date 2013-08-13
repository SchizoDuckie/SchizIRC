IRC.Channel.Userlist = new Class({

	Implements: [Options, Events],
	Binds: ["addUsers", "userJoin"],
	eventChannels: {},
	users: [],
	channelName : false,

	initialize: function(channelName) {
		this.channelName = channelName;
		var name = channelName.substring(1);

		window.addEvent('/channel/'+name+'/recv_userlist', this.addUsers);

	},

	addUsers: function(channel, users) {
		console.log("Add users to channel!" , users);
		this.users.sort();
		window.fireEvent('/userlist/update', [this.channelName, this.users]);
	},

	userJoin: function(user) {
		this.users.push(user);
		window.fireEvent('/channel/'+this.channelName.substr(1)+'/userlist', this.users);
	},

	userPart: function(user) {

	},

	userNick: function(user) {

	},


});