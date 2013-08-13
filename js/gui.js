Gui = new Class({
	Implements: [Options, Events],
	Binds: ['showActiveTab', 'userInput','userList'],
	userClassMap : { '@' : 'admin', '+' : 'voice' },
	initialize: function() {
		window.addEvent('mousedown:relay(.nav-tabs li)', this.switchTabs);
		window.addEvent('/tab/changed', this.showActiveTab);
		window.addEvent('/tab/change', this.switchTab);
		window.addEvent('submit:relay(.send)', this.userInput);
		window.addEvent('/userlist/update', this.userList);
		this.showActiveTab('home');
	},

	switchTabs: function() {
		$$(".nav-tabs li").removeClass('active');
		$(this).addClass('active');
		window.fireEvent('/tab/changed', this.getAttribute('data-tab'));
	},

	switchTab: function(newTab) {
		console.log("CHange tab to: ", newTab, $$("li[data-tab="+newTab+"]"));
		tabs = $$(".nav-tabs li");
		tabs.removeClass('active');
		$$("li[data-tab="+newTab+"]").addClass('active');
		window.fireEvent('/tab/changed', newTab);
	},

	showActiveTab: function(name) {
		$$('section[data-tab]').hide();
		$$('section[data-tab='+name+']').show();
		$$('section[data-tab='+name+'] input[type=text]')[0].focus();
	},

	userList: function(channel, users) {
		console.log("Drawing new userlist for " , channel, users);
		var list = $$(".userlist[data-channel='"+channel.substr(1)+"']");
		console.log(list);
		for(var i=0; i<users.length;i++) {
			var cls = (users[i][0] in this.userClassMap) ? this.userClassMap[users[i][0]] : 'user';
			console.log(users[i], cls);
			list.adopt(new Element('li').set({ html: users[i], 'data-user' : users[i]}).addClass(cls));
		}
	},

	userInput: function(e) {
		var target = $(e.target).getElement('input[type=text]');
		console.log("received user input:", target.value);
		e.stop();
		var chan = $(e.target).getParent('section[data-channel]');
		chan = chan ? chan.getAttribute('data-channel') : null;
		window.fireEvent('/user/input', [target.value, chan]);
		target.value = '';
	},

	/** 
	 * EventChannnels gives access connect/disconnect/data events for the server.
	 */
	hookConnection: function(ev) {
		console.log("Hooking event channels:", ev);
		window.addEvent(ev.DATAAVAILABLE, function(data) {
			$('serverStatus').adopt(new Element('P').set('html', data.getFormattedContent()));
			$('serverStatus').scrollTop = $('serverStatus').scrollHeight;
		});

	},
});

Gui.MessageDecorator = new Class({

	smileys:{
		":)" : "smile.gif",
		":-)" : "smile.gif",
		":(" : "frown.gif",
		":-(" : "frown.gif",
		":D" : "biggrin.gif",
		":-D" : "biggrin.gif",
		":s" : "huh.gif",
		":-s" : "huh.gif",
		":\/" : "nosmile.gif",
		":-\/" : "nosmile.gif",
		":P" : "puh2.gif",
		":-P" : "puh2.gif",
		":p" : "puh2.gif",
		":-p" : "puh2.gif",
		":O" : "redface.gif",
		":-O" : "redface.gif",
		":o" : "redface.gif",
		":-o" : "redface.gif",
		";)" : "wink.gif",
		";-)" : "wink.gif",
		"O+" : "heart.gif",
		";(" : "sadley.gif",
		":>" : "puh.gif",
		":*" : "puh.gif",
		"O-)" : "hypocrite.gif",
		":X" : "shutup.gif",
		":|" : "nosmile2.gif",
		"8-)" : "coool.gif",
		"8)7" : "bonk.gif",
		"8)" : "coool.gif"
		
	},

	initalize: function() {
		console.log("Gui Decorator initialized");
	},

	decorateMessage: function(msg) {
		msg = this.htmlEntities(msg);
		var msg = msg.split(" ");
		for(var i=0; i<msg.length;i++) {
			if(msg[i] in this.smileys) {
				msg[i] = ["<img src='images/",this.smileys[msg[i]],"' alt='",msg[i],"' title='",msg[i],"' style='margin-top:-5px;'>"].join('');
			}
		}
		return msg.join(' ');
	},

	htmlEntities: function (str) {
	    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	},
});
Gui.MessageDecorator = new Gui.MessageDecorator();