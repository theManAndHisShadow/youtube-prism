const EXTENSION_SETTINGS = {
    targetSite: 'www.youtube.com'
};


// waits if browser history updates
chrome.webNavigation.onHistoryStateUpdated.addListener(() => {
    (async () => {
        // get all active tabs
        const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true}); 

        // prepare url
        let url = tab.url.split('//')[1].split('/')[0]; // https://www.youtube.com/feed/subscriptions

        // if history changes from YT tabs
        if(url === EXTENSION_SETTINGS.targetSite){
            // send message
            const response = await chrome.tabs.sendMessage(tab.id, {url: tab.url});
            // do something with response here, not outside the function
        }
    })();
});