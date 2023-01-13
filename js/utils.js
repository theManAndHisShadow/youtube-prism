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
 * Returns last item of array
 * @param {Array} array 
 * @returns
 */
function getlastItem(array){
    return array[array.length - 1];
}



/**
 * Fast way find some value in 2d array;
 * Return second element of pair key - prop
 * @param {Array} array 
 * @param {*} query 
 * @returns 
 */
function searchInKeys2DArray(array, query){
    let keys = array.map(pair => {return pair[0]});
    let index = keys.indexOf(query);

    return index;
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