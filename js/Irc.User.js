IRC.User = new Class({

  nick: false,
  host: false,
  this.op = {};
  this.voice = {};
  this.halfOp = {};
  this.creator = {};

  initialize: function (nick, host) {
    console.log(" new user created!" , nick, host);
    this.update(nick, host);
  },

  rename: function (newName) {
    this.nick = newName;
  },

  setHost: function (host) {
    this.host = host;
  },

  getHost: function () {
    return this.host;
  },

  op: function (channelName) {
    this.op[channelName] = true;
  },

  deOp: function (channelName) {
    if (channelName in this.op) { delete this.op[channelName]; }
  },

  isOp: function (channelName) {
    return (channelName in this.op);
  },

  voice: function (channelName) {
    this.voice[channelName] = true;
  },

  deVoice: function (channelName) {
    if (channelName in this.voice) { delete this.voice[channelName]; }
  },

  isVoice: function (channelName) {
    return (channelName in this.voice);
  },

  halfOp: function (channelName) {
    this.halfOp[channelName] = true;
  },

  deHalfOp: function (channelName) {
    if (channelName in this.halfOp) { delete this.halfOp[channelName]; }
  },

  isHalfOp: function (channelName) {
    return (channelName in this.halfOp);
  },

  creator: function (channelName) {
    this.creator[channelName] = true;
  },

  deCreator: function (channelName) {
    if (channelName in this.creator) { delete this.creator[channelName]; }
  },

  isCreator: function (channelName) {
    return (channelName in this.creator);
  },

  update: function (nick, host) {
    this.nick = nick;
    this.host = host;
  },

  destroy: function () {
    delete this.nick;
    delete this.host;
  }
});