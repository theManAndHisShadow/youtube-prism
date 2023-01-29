// Default extension settings stores here
const EXTENSION_DEFAULT_SETTINGS = {
    targetSite: 'www.youtube.com',

    //Settings key format is now used in data- attributes at popup
    "shorts-classic-player": true,
};


// waits if browser history updates
chrome.webNavigation.onHistoryStateUpdated.addListener(async () => {
    // get all active tabs
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true}); 

    // sometimes url is undefined (on browser setting pages)
    if(tab.url) {
        // prepare url
        let url = tab.url.split('//')[1].split('/')[0]; // https://www.youtube.com/feed/subscriptions

        // if history changes from YT tabs
        if(url === EXTENSION_DEFAULT_SETTINGS.targetSite){
            // send message
            const response = await chrome.tabs.sendMessage(tab.id, {url: tab.url});
            // do something with response here, not outside the function
        }
    }
});


// waits message from other pages
chrome.runtime.onMessage.addListener(async (request) => {
    // on setting load request
    if(request.loadSettings === true) {
        let settings = await chrome.storage.sync.get('settings');

        // if user turn on extension for first time
        if(!settings || (typeof settings === 'object' && Object.keys(settings).length === 0)) {
            chrome.storage.sync.set({
                settings: EXTENSION_DEFAULT_SETTINGS
            });

            // save default
            settings = await chrome.storage.sync.get('settings');
        }

        if(request.from === "core"){
            const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true}); 
    
            // send settings
            const response = await chrome.tabs.sendMessage(tab.id, settings);
        } else if(request.from === "popup") {
            chrome.runtime.sendMessage(settings);
        }
    }
});