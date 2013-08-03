chrome.app.runtime.onLaunched.addListener(function() {

  chrome.app.window.create('index-chrome.html', {
    bounds: {
      width: 900,
      height: 650
    }
  }, function(createdWindow) {
    appWindow = createdWindow.dom;

  });

});
