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
    // TODO: Refactor this code block
    // This solution is very unoptimal, cause make node.. 
    // ..clone operations and force page to reload
    asyncQuerySelector('#start a#logo').then(logoLink => {
        // YouTube logo button
        let logoButton = logoLink.parentNode;
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
    });

    // Removing first three elements from full size left menu
    asyncQuerySelector('#sections #items').then(leftMenuBlock => {
        // remove main page button from menu
        leftMenuBlock.children[0].remove();

        // remove shorts page button from menu
        leftMenuBlock.children[0].remove();
    });

    asyncQuerySelector('#sections ytd-guide-section-renderer:nth-child(3)').then(navigatorBlock => {
        navigatorBlock.remove();
    });

    asyncQuerySelector('#sections ytd-guide-section-renderer:nth-child(4)').then(otherFeaturesBlock => {
        otherFeaturesBlock.remove();
    });
    
    // Removing mini menu
    asyncQuerySelector('ytd-mini-guide-renderer[role="navigation"] #items').then(miniMenu => {
        miniMenu.parentNode.remove();
    });
});