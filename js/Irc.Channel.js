IRC.Channel = new Class({
    
    Implements: [Options, Events],
    Binds: ['onMessage','draw'],
    users: false,
    log: [],
    name: false,
    normalizedName: false,
    channelLog: false,
    topic: false,


    initialize: function(name) {
    	console.log("---------------->New channel joined!", name);
    	this.name = name;
    	this.normalizedName = name.substr(1);
    	this.draw();
    	window.addEvent('/channel/'+this.normalizedName+'/message', this.onMessage);
    	window.fireEvent('/tab/change', ['channel_'+this.normalizedName]);
    	this.channelLog = 'chanlog_'+this.normalizedName;
    	this.users = new IRC.Channel.Userlist(name);
    },

    onMessage:function(message) {
    	console.log("[IRC.Channel] Received new message for " ,this.name, " : " , message, this.channelLog);
    	var chan = this.channelLog;
    	setTimeout(function() {
    		var el = new Element('p').addClass(message.messageCode).set('html', message.getFormattedContent());
			if(message.isAction) { el.addClass('ACTION'); }
    		$(chan).adopt(el);    		
    	}, 0);
    	
    	console.log(this.channelLog);
    	this.log.push(message);    	
    },

    draw: function() {
    	console.log("DRawing new channel!");
    	$('ircContainer').innerHTML += Mustache.to_html($('tpl_channelContent').get('html'), { channelName: this.normalizedName });
    	$('tabContainer').innerHTML += Mustache.to_html($('tpl_channelTab').get('html'), { channelName: this.normalizedName });

    },

    destroy: function() {


    },

});