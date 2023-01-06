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
 * Solution from https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
 * @param {String} selector CSS Selector
 * @returns 
 */
function asyncQuerySelector(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}



preventMainPageLoading();

document.addEventListener("DOMContentLoaded", function(){
    asyncQuerySelector('#start a#logo').then(logoLink => {
        logoLink.href = newHomeLink;
    });

    asyncQuerySelector('#sections ytd-guide-entry-renderer').then(element => {
        let leftMenu = element.parentNode;

        // remove main page button from menu
        leftMenu.children[0].remove();

        // remove shorts page button from menu
        leftMenu.children[0].remove();

        // remove subs page button from menu
        leftMenu.children[0].remove();
    });
});