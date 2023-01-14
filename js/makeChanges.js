// Doing some changes here

// If user change page, we can reuse some parts of code below at this script
// Cause  Prism.atPage('any').execute() save .execute() inner function to page name prop...
/// ...at executionList
Prism.detectURLModify();

// Preventing default YouTube main page loading
Prism.atPage('main').redirectTo('subscriptions');

document.addEventListener("DOMContentLoaded", function(){

    Prism.atPage('any').execute(() => {
        // Changing YT logo at any YT page
        Prism.findElement('ytd-topbar-logo-renderer#logo').modify(logo => {
            Prism.html.logo.modify({
                logoRef: logo,
                textMark: 'prism',
                onclick: function(){
                    // YT has some own redirect system, just emulates needed click to redirect on subs page
                    Prism.findElement('#sections #items ytd-guide-entry-renderer').modify(subsButton => {
                        subsButton.click();
                    });
                }
            });
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
            // console.log(otherFeaturesBlock);
        });
        
        // Removing mini menu
        Prism.findElement('ytd-mini-guide-renderer[role="navigation"] #items').modify(miniMenu => {
            miniMenu.parentNode.remove();
        });
    });
    
    Prism.atPage('subscriptions').execute(() => {});
    
    Prism.atPage('watch').execute(() => {
        // Extra actions to change YT logo at watch page
        Prism.findElement('#contentContainer ytd-topbar-logo-renderer').modify(logo => {
            Prism.html.logo.modify({
                logoRef: logo,
                textMark: 'prism',
                onclick: function(){
                    // YT has some own redirect system, just emulates needed click to redirect on subs page
                    Prism.findElement('#sections #items ytd-guide-entry-renderer').modify(subsButton => {
                        subsButton.click();
                    });
                }
            });
        });

        // Actions with playlist play next video button
        // It is important beacause default play next video...
        // ...button on playlist end - play related video
        Prism.findElement('#items ytd-playlist-panel-video-renderer').modify(playlistVideo => {
            let playlist = playlistVideo.parentNode.children;

            Prism.findElement('.ytp-left-controls a.ytp-next-button.ytp-button').modify(nextButton => {
                // when page full reloaded
                Prism.html.nextVideoButton.toggle(nextButton, playlist);     
                
                // if user clicked next video button, check if next video is last video
                nextButton.addEventListener("click", () => {
                    Prism.html.nextVideoButton.toggle(nextButton, playlist, nextButton.href);
                });

                // if user clicked prev video
                Prism.findElement('.ytp-left-controls a.ytp-prev-button.ytp-button').modify(prevButton => {
                    prevButton.addEventListener("click", () => {
                        // check is not replay mode (prev button href must be not empty)
                        // and if is TRULY not replay mode - unhide next video button*
                        // *because all prev links not linked with related video...
                        // ...we can unhide next video button
                        if(prevButton.href.length > 0) Prism.html.nextVideoButton.toggle(nextButton, playlist, prevButton.href);
                    });
                });

                // if user just play other video, get current url from playlist, and toggle button
                Array.from(playlist).forEach(listItem => {
                    listItem.addEventListener("click", () => {
                        let listItemURL = listItem.children[0].href;
                        Prism.html.nextVideoButton.toggle(nextButton, playlist, listItemURL);
                    });
                });
            });
        });

        // Removing the most distractive feature - realted videos >:}
        Prism.findElement('#secondary #related').modify(related => {
            related.remove();
        });
    });
});