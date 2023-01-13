// All functions defines here 

// temp const
const newHomeLink = "https://www.youtube.com/feed/subscriptions";


/**
 * Main extension object
 */
const Prism = {
    // target page URLs
    urls: {
        watch: 'https://www.youtube.com/watch',
        subscriptions:  'https://www.youtube.com/feed/subscriptions',
        main:  'https://www.youtube.com/',
        any:   'any',
    },

    html: {
        elementSearchHistory: [],
    },
    
    actions: {
        // state marker that current page targeted by atPage
        isNecessaryPage: false,

        // list of saved function for special page
        executionList: {},
    },


    /**
     * Controls that current page is targeted. Impacts to isNecessaryPage prop
     * @param {string} pageName 
     * @returns 
     */
    atPage: function (pageName){
        let url = window.location.href;
        let isAnyPage = pageName === "any";
        let isMainPage = pageName === 'main' && url === Prism.urls[pageName];

        // is url exist on url list
        if(Prism.urls[pageName]){
            if(
                   isAnyPage 
                || isMainPage 
                || parseURL(url).pageName === parseURL(Prism.urls[pageName]).pageName
            ) {
                Prism.actions.isNecessaryPage = true;  
            } else {
                Prism.actions.isNecessaryPage = false;
            }
        } else {
            throw new Error(pageName + " page does not exist!");
        }


        // chain
        return {
            /**
             * Execute some code on targeted page. Depends on isNecessaryPage prop
             * @param {Function} callback 
             */
            execute: function(callback){
                Prism.actions.executionList[pageName] = callback;

                if(Prism.actions.isNecessaryPage === true) {
                    callback();
                }
    
                Prism.actions.isNecessaryPage = false;

                console.log(Prism.actions);
            },



            /**
             * Redirect to Youtube target page by page name (look Prism.urls)
             * @param {string} pageName target page name
             */
            redirectTo: function(pageName){
                if(Prism.actions.isNecessaryPage === true) {
                    let url_redirect = document.createElement("a");
                    url_redirect.href = Prism.urls[pageName];
            
                    url_redirect.click();
                }

                Prism.actions.isNecessaryPage = false;
            }
        };
    },


    /**
     * Detects if page relaoded or url changed by redirecting to other page
     */
    detectURLModify: function(){
        // Waits one message from extension backend
        // For more info: https://developer.chrome.com/docs/extensions/mv3/messaging/#native-messaging
        chrome.runtime.onMessage.addListener(
            function(message) {
                let pageName = parseURL(message.url).pageName;

                // if new page name exists in list
                if(Prism.actions.executionList[pageName]){
                    // invoke page script, that saves in firest exection to 
                    // special key
                    Prism.actions.executionList[pageName]();
                    console.log("script executions from executionList is done");
                }
            }
          );
    },



    /**
     * Searchs in DOM tree target element by querySelector
     * @param {Array|string} selector May be array of queries or single query
     * @returns modify() function, that contains referance to target element
     */
    findElement: function(selector){
        // Trying to find selector in history
        let index = searchInKeys2DArray(Prism.html.elementSearchHistory, selector);

        // if finded just put in in result var
        if(index > -1){
            result = Prism.html.elementSearchHistory[index][1];
        } else { // else make async query
            result = asyncQuerySelector(selector);
        }


        // chain
        return {
            /**
             * Give access to finded element and invoke callback to make modify changes
             * @param {Function} callback 
             */
            modify: function(callback){
                // If result is not ready and Primise is pending
                if(result instanceof Promise) {
                    // when promise os resolved
                    result = result.then(element => {
                        // check index again
                        index = searchInKeys2DArray(Prism.html.elementSearchHistory, selector);

                        // if query dont finded in history - push it to history
                        if(index === -1) Prism.html.elementSearchHistory.push([selector, element]);

                        callback(element);
                    });
                } else {
                    callback(result);
                }
            }
        }
    }
};




/**
 * Remaking YT logo button behavior: from redirecting to main page to redirecting to subs page
 * @param {Object} logoButton HTMLElement object reference
 */
function remakeLogoButton(logoButton){
    let clonedLogoButton = logoButton.cloneNode(true);

    // Replacing to remove main page redirect on click
    // IDK how to prevent main page redirect...
    logoButton.parentNode.replaceChild(clonedLogoButton, logoButton);

    let cloned_logoLink = clonedLogoButton.children[0];
    let cloned_logoText = clonedLogoButton.children[0].children[0];
    let cloned_logoCountryMark = clonedLogoButton.children[1];

    cloned_logoLink.href = newHomeLink;
    cloned_logoText.removeAttribute('hidden');
    cloned_logoCountryMark.removeAttribute('hidden');

    // changing logo button functional
    clonedLogoButton.addEventListener("click", function(event){
        // prevent full page refresh
        event.preventDefault();

        // query subs page button
        asyncQuerySelector('#sections #items ytd-guide-entry-renderer').then(element => {
            element.click(); // emuating subs page nutton clicking
        });
    });

    // show extension mark :)
    cloned_logoCountryMark.innerText = 'prism';
}


/**
 * Checks if playlist length, current video ID 
 * and playlist videos IDs and show or hide unnecessary 'play next video' button
 */
function showOrHideNextVideoButton(){
    function _showOrHide(playlist, currentVideoURL){
        let currentVideoID = parseURL(currentVideoURL).v;
        let lastVideo = playlist[playlist.length - 1];
        let lastVideoID = parseURL(lastVideo.children[0].href).v;

        console.log(currentVideoID, lastVideoID);

        // ...and playlist length greaater than zero and it is not last video* on playlist
        // *cause i this case play next vide button plays next RELATED video
        if(playlist.length > 0 && lastVideoID !== currentVideoID) {
            asyncQuerySelector('.ytp-left-controls a.ytp-next-button.ytp-button').then(nextButton => {
                nextButton.removeAttribute("hidden"); // unhide next video button
            });
        } else {
            asyncQuerySelector('.ytp-left-controls a.ytp-next-button.ytp-button').then(nextButton => {
                nextButton.setAttribute("hidden", "");
            });
        }
    }

    // If user don`t create a playlist - hide next video button
    // cause by default next video button plays next related video
    asyncQuerySelector('.ytp-left-controls a.ytp-next-button.ytp-button').then(nextButton => {
        nextButton.setAttribute("hidden", "");
    });


    // but if user playlist is exist
    asyncQuerySelector('ytd-playlist-panel-video-renderer').then(playlistVideo => {
        let playlist = playlistVideo.parentNode.children;

        // if page full reloaded
        _showOrHide(playlist, window.location.href);

        // if user clicked next video button, check is next last video
        asyncQuerySelector('.ytp-left-controls a.ytp-next-button.ytp-button').then(nextButton => {
            console.log(nextButton);

            nextButton.addEventListener("click", () => {
                _showOrHide(playlist, nextButton.href);
            });
        });


        // if user clicked prev video
        asyncQuerySelector('.ytp-left-controls a.ytp-prev-button.ytp-button').then(prevButton => {
            prevButton.addEventListener("click", () => {
                // check is not replay mode (prev button href must be not empty)
                // and if is TRULY not replay mode - unhide next video button*
                // *because all prev links not linked with related video...
                // ...we can unhide next video button
                if(prevButton.href.length > 0) _showOrHide(playlist, prevButton.href);
            });
        });

        // if user just play other video, get current video url from playlist
        Array.from(playlist).forEach(listItem => {
            listItem.addEventListener("click", () => {
                _showOrHide(playlist, listItem.children[0].href);
            });
        })
    });
}