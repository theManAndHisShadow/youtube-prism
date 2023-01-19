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

    playlist: {
        // video urls from playlist
        IDs: [],
        nodes: [],
        parse: function(playlistParent){
            let list = Array.from(playlistParent.children);

            list.forEach(item => {
                // only if it video tag
                if(item.tagName === 'YTD-PLAYLIST-PANEL-VIDEO-RENDERER') {
                    // get url
                    let url = parseURL(item.children[0].href).v;
                    // push to array
                    Prism.playlist.IDs.push(url);
                    Prism.playlist.nodes.push(item);
                };
            });
        },

        /**
         * 
         * @param {string} id 
         */
        add: function(id){
            Prism.playlist.IDs.push(id);
        }
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

        nextVideoButton: {
            /**
             * Show or hide 'play next video' button
             * @param {HTMLElement} nextVideoButton reference to HTMLElement of button
             * @param {string} id (optional) clicked element video ID
             */
            toggle: function(nextVideoButton, id){
                // if id arg empty - use next video button`s video ID
                id = id || parseURL(nextVideoButton.href).v
                let lastID = getlastItem(Prism.playlist.IDs);

                    // If next video ID exist in array of current playlist videos
                    if(Prism.playlist.IDs.indexOf(id) > -1){
                        // if next video is last element of playlist
                        if(id === lastID) {
                            nextVideoButton.setAttribute("hidden", '');
                        } else {
                            nextVideoButton.removeAttribute("hidden");
                        }
                    } else {
                        // If next video do not contains in array
                        nextVideoButton.setAttribute("hidden", '');
                    }
            },

            hide: function(HTMLElement){
                HTMLElement.setAttribute("hidden", '');
            },

            show: function(HTMLElement){
                HTMLElement.removeAttribute("hidden");
            },
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
        let result = null;

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
    },



    /**
     * Helps listen target element and detects attr mutations
     * @param {HTMLElement} target element listen to
     * @param {string} attribute target attribue
     * @param {Function} condition callback-function with condition, that fires resolve
     * @returns 
     */
    detectAttrMutation: function(target, attribute, condition) {
        return new Promise(resolve => {
            const observer = new MutationObserver(mutations => {
                if (condition(target)) {
                    resolve(target);
                    observer.disconnect();
                }
            });

            observer.observe(target, {attributes: true, attributeFilter: [attribute]});
        });
    }
};