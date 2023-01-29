const PrismPopup = {
    //data attribute prefixes of target elements
    settingsPrefix: "data-settings__",

    html: {
        settingsCheckboxes: {
            "shorts-classic-player": null,
        }
    },

    
    init: function(){
        PrismPopup.html.settingsCheckboxes['shorts-classic-player'] = document.querySelector(`[${PrismPopup.settingsPrefix}shorts-classic-player]`);
    },


    /**
     * Requests extension settings from backend (ackground).
     * @returns Promise
     */
    requestCurrentSettings: async function(){
        chrome.runtime.sendMessage({loadSettings: true, from: "popup"});

        return new Promise((resolve, reject) => {
            chrome.runtime.onMessage.addListener(function(message) {
                if(message.settings) {
                    resolve(message.settings);
                } else {
                    reject();
                }
            });
        });
    },


    /**
     * Load and shows settings to popup page.
     */
    loadSettings: async function(){
        let settings = await PrismPopup.requestCurrentSettings();
        let keys = Object.keys(settings);

        // Using same key name (for example "shorts-classic-player") 
        // makes loading settings to popup interface easier 
        // Because a Prism Popup.html elements stored using same key words
        keys.forEach(settingItem => {
            // just transfer bolean state to input[checkbox].checked
            PrismPopup.html.settingsCheckboxes[settingItem].checked = settings[settingItem];
        })
    },
};


document.addEventListener("DOMContentLoaded", function(){
    PrismPopup.init();
    PrismPopup.loadSettings();
});