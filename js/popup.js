const PrismPopup = {
    settings: null,
    loadSettings: function(){
        chrome.runtime.sendMessage({loadSettings: true, from: "popup"});

        chrome.runtime.onMessage.addListener(function(message) {
            if(message.settings) {
                PrismPopup.settings = message.settings;
                console.log(PrismPopup);
            }
        });
    },
};

PrismPopup.loadSettings();