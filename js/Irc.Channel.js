IRC.Channel = new Class({
    
    Implements: [Options, Events],

    users: {

    },
    
    log: {

    },

    initialize: function(name) {
    	console.log("---------------->New channel joined!", name);
    	this.name = name;
    	this.draw();
    },

    draw: function() {
    	console.log("DRawing new channel!");
    	$('ircContainer').innerHTML += Mustache.to_html($('tpl_channelContent').get('html'), { channelName: this.name.replace('#' ,'') });
    	$('tabContainer').innerHTML += Mustache.to_html($('tpl_channelTab').get('html'), { channelName: this.name.replace('#' ,'') });
    },

    destroy: function() {


    },

});