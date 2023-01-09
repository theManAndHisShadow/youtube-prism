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