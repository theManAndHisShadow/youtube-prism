// Doing some changes here

preventMainPageLoading();

document.addEventListener("DOMContentLoaded", function(){
    // TODO: Refactor this code block
    // This solution is very unoptimal, cause make node.. 
    // ..clone operations
    asyncQuerySelector('#start a#logo').then(logoLink => {
        // YouTube logo button 
        remakeLogoButton(logoLink.parentNode);
    });

    // For cases, where YT logo button also placed in collapsed left menu. F
    // or example, on watch page
    asyncQuerySelector('#contentContainer a#logo').then(logoLink => {
        remakeLogoButton(logoLink.parentNode);
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

    // Removing the most distractive feature - realted videos >:}
    asyncQuerySelector('#secondary #related').then(related => {
        related.remove();
    });
});