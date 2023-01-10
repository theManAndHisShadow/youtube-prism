// All functions defines here 
const newHomeLink = "https://www.youtube.com/feed/subscriptions";


function preventMainPageLoading(){
    let path = document.location.pathname;

    if(path === "/") {
        let url_redirect = document.createElement("a");
        url_redirect.href = newHomeLink;

        url_redirect.click();
    }
}



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
 * Intelegent query function.
 * Use CSS selector, to query some HTMLElement. Based on document.querySelector.
 * Can wark with multiple query, just pass array of query selectors.
 * Observer idea from this solution: https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
 * @param {(string|Array)} selector CSS Selector
 * @returns 
 */
function asyncQuerySelector(selectors) {
    // If is single query, make array
    if(!Array.isArray(selectors)) selectors = [selectors];

    let targets = [];

    // Some soup of Promises, lol
    // Global promise control that all queries from array are satisfied
    return new Promise(fullResolve => {
        selectors.forEach(selector => {
            // Local promise wait when HTMLElement is visible and exist
            return new Promise(arrayResolve => {
                // if exit return it using resolve
                if (document.querySelector(selector)) {
                    return arrayResolve(document.querySelector(selector));
                }
                
                // or use MutationObserver monster
                const observer = new MutationObserver(mutations => {
                    if (document.querySelector(selector)) {
                        arrayResolve(document.querySelector(selector));
                        observer.disconnect();
                    }
                });
        
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }).then(resultOfAsyncQuery => {
                // when local promise finally waited element - push it to array
                targets.push(resultOfAsyncQuery);

                console.log(targets);

                // if all selectors finded - return using global promise resolve
                if(targets.length === selectors.length) {
                    // if target length is equals 1, 
                    // that means function works in single mode
                    if(targets.length === 1) {
                        fullResolve(targets[0]);
                    } else {
                    // else return entire array, and function works in multi mode
                        fullResolve(targets);
                    }
                }
            });
        });
    });
}



/**
 * Get url and returns object with splited search keys
 * @param {String} url url from browser url bar or url from anchor href
 * @returns Object of result with params like v = video, list = video playlist, 
 * index = video index in playlist and etc.
 */
function parseURL(url){
    let object = {};
    let splitedURL = url.split("//")[1].split("/")[1];
    let cleaned = splitedURL.match(/(\?|\&)/gm) ? splitedURL.split("?")[1].split("&") : splitedURL;

    cleaned.forEach(key => {
        key = key.split("=");

        object[key[0]] = key[1];
    });

    return object;
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