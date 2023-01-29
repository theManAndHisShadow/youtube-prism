// All helper functions defined here



/**
 * Get url and returns object with splited search keys
 * @param {String} url url from browser url bar or url from anchor href
 * @returns Object of result with params like pageName, v = video, list = video playlist, 
 * index = video index in playlist and etc.
 */
function parseURL(url){
    let resultObject = {};
    let pageAndArgs = getlastItem(url.split("//")[1].split("/"));
    let pageName = pageAndArgs.match(/(\?|\&)/gm) ? pageAndArgs.split("?")[0] : pageAndArgs;
    let args = pageAndArgs.match(/(\?|\&)/gm) ? pageAndArgs.split("?")[1].split("&") : null;

    resultObject.pageName = pageName;

    if(Array.isArray(args)){
        args.forEach(key => {
            key = key.split("=");
    
            resultObject[key[0]] = key[1];
        });
    }

    return resultObject;
}



/**
 * Redirects user to some (target) page. 
 * @param {string} url target page url
 */
function redirectTo(url){
    let url_redirect = document.createElement("a");
        url_redirect.href = url;

        url_redirect.click();
}



/**
 * Returns last item of array
 * @param {Array} array 
 * @returns
 */
function getlastItem(array){
    return array[array.length - 1];
}



/**
 * Clones element without event listener and replace original element with clone
 * @param {HTMLElement} elementRef 
 * @return {HTMLElement} new cloned element
 */
function removeAllEventListenerOfElement(elementRef){
    let cloned = elementRef.cloneNode(true);
    let parent = elementRef.parentNode;

    parent.replaceChild(cloned, elementRef);

    return cloned;
}



/**
 * Intelegent query function.
 * Use CSS selector, to query some HTMLElement. Based on document.querySelector.
 * Observer idea from this solution: https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
 * @param {(string|Array)} selector CSS Selector
 * @returns 
 */
function asyncQuerySelector(selector) {
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
    });
}