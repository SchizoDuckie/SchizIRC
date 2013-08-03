/**
 * Implementation of all IRC commands plus their aliasses.
 */

IRC.Commands = new Class({

	server: false,

	initialize: function(server) {
		this.server = server;
	},

 	CHANNEL_MODES : {
      "&":"&",
      "#":"#",
      "+":"+",
      "!":"!"
    },

    isValid: function(commandName) {
    	return (commandName.toUpperCase() in this);
    },

    /**
     * as per RFC 2812
	 * returns if given string could be a channel name
	 * this should be used instead of checking for a # for first character
	 */
	isChannelName: function (name) {
	    return (name && name.length && (name[0] in this.CHANNEL_MODES));
	},

	N: function(msg) {
		return this.NICK(msg);
	},

	NICK: function(msg) {
	        this.server.send('NICK '+msg);
	        console.log("attempting to change nick to ", msg);;
	        
	},

	PASS: function(msg) {
	        msg = "";
	        if (msg && msg.length) {
	          msg = msg.join(" ");
	        }
	        this.server.pass(msg);
	        console.log("sending pass: " + msg);
	        
	},

	J: function(msg) {
		return this.JOIN(msg);
	},

	JOIN: function(msg) {
		if(this.isChannelName(msg)) {
			this.server.send('JOIN ' +msg);	
			document.fireEvent('/channel/join', [msg]);
		}               
        console.log("attempting to join channel(s) : " +msg);;
        
	},

	M: function(msg) {
		return this.MODE(msg);
	},

	MODE: function(msg) {
        this.server.send('MODE ' +msg);
        
	},

	K: function(msg) {
		return this.KICK(msg);
	},

	KICK: function(msg) {
        this.server.send('KICK '+msg);
	},

	MOTD: function() {
        this.server.send('MOTD');
        
	},

	WHOIS: function(msg) {
      	this.server.send('WHOIS '+msg);
        
	},

	WHOWAS: function(msg) {
        msg = "";
        if (msg && msg.length) {
          msg = msg.join(" ");
        }
        this.server.sendWhoWas(msg);
        
	},

	SQUIT: function(msg) {
        if (msg && msg.length > 1) {
          serverName = msg.shift();
          msg = msg.join(" ");
          this.server.sendSQuit(serverName, msg);
        }
        
	},

	INVITE: function(msg) {
        if (msg && msg.length > 1) {
          nick = msg.shift();
          channel = msg.shift();
          this.server.sendInvite(nick, channel);
        }
        
	},

	DIE: function(msg) {

	},

	RESTART: function(msg) {

	},

	REHASH: function(msg) {
        _cmd = cmd;
        funcName = "send" + _cmd;
        if (funcName in this.client) {
          this.client[funcName]();
        }
        
	},

	AWAY: function(msg) {

	},

	PASS: function(msg) {

	},

	WALLOPS: function(msg) {

	},

	USERS: function(msg) {
	},

	INFO: function(msg) {
	},

	ADMIN: function(msg) {
	},

	TRACE: function(msg) {
	},

	TIME: function(msg) {
	},

	VERSION: function(msg) {
	        if (msg && msg.length) {
	          param = msg.shift();
	        } else {
	          param = null;
	        }
	        _cmd = cmd;
	        _cmd = _cmd[0].toUpperCase() + _cmd.substr(1);
	        funcName = "send" + _cmd;
	        if (funcName in this.client) {
	          this.client[funcName](param);
	        }
	        
	},

	ISON: function(msg) {
	},

	LIST: function(msg) {
	},

	USERHOST: function(msg) {
	},

	SUMMON: function(msg) {
	},

	PING: function(msg) {
	},

	KILL: function(msg) {
	},

	WHO: function(msg) {
	},

	SQUERY: function(msg) {
	},

	CONNECT: function(msg) {
	},

	LINK: function(msg) {
	},

	STATS: function(msg) {
	},

	LUSERS: function(msg) {
	},

	OPER: function(msg) {

	},

	SERVICE: function(msg) {
        params = "";
        if (msg && msg.length) {
          params = msg.join(" ");
        }
        _cmd = cmd;
        _cmd = _cmd[0].toUpperCase() + _cmd.substr(1);
        funcName = "send" + _cmd;
        if (funcName in this.client) {
          this.client[funcName](params);
        }
        
	},

	P: function(msg) {
		return this.part(msg);
	},

	PART: function(msg) {
		var chan = this.isChannelName(msg.split(' ')[0]) ? msg.split(' ')[0] : this.server.getActiveChannel();
		this.server.send('PART '+chan+' '+msg.replace(chan, ''));        
	},

	Q: function(msg) {
		return this.QUIT(msg);
	},

	QUIT: function(msg) {
        this.server.send('QUIT '+msg);
	},

	CTCP: function(msg) {
        if (msg && msg.length > 1) {
          target = msg.shift();
          msg = msg.join(" ");
          if (msg.toLowerCase().trim() === "ping") {
            this.server.sendCTCPPing(target);
          } else {
            this.server.sendCTCP(target, msg);
          }
        }
        
	},

	ME: function(msg) {
        this.server.sendAction(this.server.getActiveChannel(), msg);
        this.handleAction(this.getNick(), this.host, target, msg);
        
	},

	NAMES: function(msg) {
        if (this.isChannelName(target)) {
          this.server.sendNames(target);
        }
        
	},

	Q: function(msg) {
		return this.query(msg);
	},

	QUERY: function(msg) {
		this.server.send('QUERY '+msg);
	},

	MSG: function(msg) {
        if (msg && msg.length > 1) {
          target = msg.shift();
          msg = msg.join(" ");
          this.sendMessage(target, msg);
        }
        
	},

	NOTICE: function(msg) {
        if (msg && msg.length > 1) {
          target = msg.shift();
          msg = msg.join(" ");
          this.server.sendNotice(target, msg);
          this.handleNotice(this.getNick(), this.host, target, msg);
        }
        
	},

	T: function(msg) {
		return this.TOPIC(msg);
	},

	TOPIC: function(msg) {
        if (msg && msg.length) {
          t = msg.shift();
          if (!this.isChannelName(t)) {
            msg.unshift(t);
            t = target;
          }
          msg = msg.join(" ");
        } else {
          msg = "";
          t = target;
        }
        this.server.topic(t, msg);
        
    }

});