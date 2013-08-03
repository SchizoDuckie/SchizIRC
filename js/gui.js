Gui = new Class({
	Implements: [Options, Events],
	Binds: ['showActiveTab', 'userInput'],
	inputFields: false,

	initialize: function() {
		$(document).addEvent('mousedown:relay(.nav-tabs li)', this.switchTabs);
		$(document).addEvent('/tab/changed', this.showActiveTab);
		$(document).addEvent('submit:relay(#send)', this.userInput);
		this.inputField = $$('.command');
		this.showActiveTab();
	},

	switchTabs: function() {
		var tabs = $$(".nav-tabs li");
		tabs.removeClass('active');
		$(this).addClass('active');
		document.fireEvent('/tab/changed', this.getAttribute('data-tab'));
	},

	showActiveTab: function(name) {
		$$('section[data-tab]').hide();
		$$('section[data-tab='+name+']').show();
	},

	userInput: function(e) {
		var target = $(e.target).getElement('input[type=text]');
		console.log("received user input:", target.value);
		e.stop();
		document.fireEvent('/user/input', target.value);
		target.value = '';
	},

	/** 
	 * EventChannnels gives access connect/disconnect/data events for the server.
	 */
	hookConnection: function(ev) {
		console.log("Hooking event channels:", ev);
		$(document).addEvent(ev.DATAAVAILABLE, function(data) {
			$('serverStatus').adopt(new Element('P').set('html', data.getContent()));
		});

	},
})