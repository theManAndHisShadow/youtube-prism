// Doing some changes here

Prism.atPage('main').redirectTo('subscriptions');

document.addEventListener("DOMContentLoaded", function(){

    Prism.atPage('any').execute(() => {
        Prism.findElement('#start a#logo').modify(logoLink => {
            remakeLogoButton(logoLink.parentNode);
        });

        // For cases, where YT logo button also placed in collapsed left menu. F
        // or example, on watch page
        Prism.findElement('#contentContainer a#logo').modify(logoLink => {
            remakeLogoButton(logoLink.parentNode);
        });

        // Removing first three elements from full size left menu
        Prism.findElement('#sections #items').modify(leftMenuBlock => {
            // remove main page button from menu
            leftMenuBlock.children[0].remove();

            // remove shorts page button from menu
            leftMenuBlock.children[0].remove();
        });

        // removing navigator block
        Prism.findElement('#sections ytd-guide-section-renderer:nth-child(3)').modify(navigatorBlock => {
            navigatorBlock.remove();
        });

        // removing other features bock
        Prism.findElement('#sections ytd-guide-section-renderer:nth-child(4)').modify(otherFeaturesBlock => {
            otherFeaturesBlock.remove();
        });
        
        // Removing mini menu
        Prism.findElement('ytd-mini-guide-renderer[role="navigation"] #items').modify(miniMenu => {
            miniMenu.parentNode.remove();
        });
    });
    
    Prism.atPage('subscriptions').execute(() => {});
    
    Prism.atPage('watch').execute(() => {
        // Removing the most distractive feature - realted videos >:}
        Prism.findElement('#secondary #related').modify(related => {
            related.remove();
        });
    });


    showOrHideNextVideoButton();
});