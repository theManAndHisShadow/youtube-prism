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



        /**
         * Execute some code on targeted page. Depends on isNecessaryPage prop
         * @param {Function} callback 
         */
        execute: function(callback){
            if(this.isNecessaryPage === true) callback();

            this.isNecessaryPage = false;
        },



        /**
         * Redirect to Youtube target page by page name (look Prism.urls)
         * @param {string} pageName target page name
         */
        redirectTo: function(pageName){
            if(this.isNecessaryPage === true) {
                let url_redirect = document.createElement("a");
                url_redirect.href = Prism.urls[pageName];
        
                url_redirect.click();
            }

            this.isNecessaryPage = false;
        }
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

        if(Prism.urls[pageName]){
            if(
                   isAnyPage 
                || isMainPage 
                || parseURL(url).pageName === parseURL(Prism.urls[pageName]).pageName
            ) {
                this.actions.isNecessaryPage = true;  
            } else {
                this.actions.isNecessaryPage = false;
            }
        } else {
            throw new Error(pageName + " page does not exist!");
        }

        return this.actions;
    },

    /**
     * Searchs in DOM tree target element by querySelector
     * @param {string} selector 
     * @returns onLoad()
     */
    findElement: function(selector){
        let index = searchIn2DArray(Prism.html.elementSearchHistory, selector);

        if(index > -1){
            result = Prism.html.elementSearchHistory[index][1];
        } else {
            result = asyncQuerySelector(selector);
        }

        return {
            onLoad: function(callback){
                if(result instanceof Promise) {
                    result = result.then(element => {
                        index = searchIn2DArray(Prism.html.elementSearchHistory, selector);

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