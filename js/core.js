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
        library: 'https://www.youtube.com/feed/library',
        main:  'https://www.youtube.com/',
        any:   'any',
    },

    //HTML based methods
    html: {
        // for less Primese and Observer calls Prism saves search result here
        elementSearchHistory: [],

        // logo mutations
        logo: {
            modify: function({logoRef, textMark = 'custom', onclick = false}){
                // removing default event listeners
                let cleaned = removeAllEventListenerOfElement(logoRef);
                let link = cleaned.children[0];
                let text = cleaned.children[0].children[0];
                let mark = cleaned.children[1];

                mark.innerText = textMark; // show extension mark :)

                link.href = Prism.urls.subscriptions;
                text.removeAttribute('hidden');
                mark.removeAttribute('hidden');

                // onclick replacer
                if(onclick instanceof Function){
                    // changing logo button behavior
                    cleaned.addEventListener("click", function(event){
                        event.preventDefault();
                        onclick();
                    });
                }
            },
        },

        playlist: {
            // video urls from playlist
            urls: [],
            parse: function(playlistParent){
                let list = Array.from(playlistParent.children);

                list.forEach(item => {
                    // only if it video tag
                    if(item.tagName === 'YTD-PLAYLIST-PANEL-VIDEO-RENDERER') {
                        // get url
                        let url = parseURL(item.children[0].href).v;
                        // push to array
                        Prism.html.playlist.urls.push(url);
                    };
                });
            },
        },

        nextVideoButton: {
            toggle: function(nextVideoButton, playlist, videoURL = window.location.href){
                let currentVideoID = parseURL(videoURL).v;
                let lastVideo = getlastItem(playlist);
                let lastVideoID = parseURL(lastVideo.children[0].href).v;
        
                // ...and playlist length greaater than zero and it is not last video* on playlist
                // *cause i this case play next vide button plays next RELATED video
                if(playlist.length > 0 && lastVideoID !== currentVideoID) {
                    nextVideoButton.removeAttribute("hidden"); // unhide next video button
                } else {
                    nextVideoButton.setAttribute("hidden", "");
                }
            }
        }
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
                    console.log("script executions from executionList is done, page: ", pageName);
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