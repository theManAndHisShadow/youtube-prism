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
        });
        
        // Removing mini menu
        Prism.findElement('ytd-mini-guide-renderer[role="navigation"] #items').modify(miniMenu => {
            miniMenu.parentNode.remove();
        });

        // 'add to queue' button must impact at 'play next video' button behavior
        // On page that has #contents block (subs, library...)
        Prism.findElement('#contents').modify(element => {
            // check if user click on some #contents child element
            element.addEventListener('mousedown', event => {
                // target element - 'add to queue' button
                let addToQueueButtonNode = event.target.parentNode;
                let addToQueueButtonTagName = 'ytd-thumbnail-overlay-toggle-button-renderer';

                // if child element has needed tag and it is target button
                let isNodeTagCorrect = addToQueueButtonNode.tagName.toLowerCase() === addToQueueButtonTagName;
                let isNodeSecondChild = addToQueueButtonNode === event.target.parentNode.parentNode.children[1];

                // check condition above
                if(isNodeTagCorrect && isNodeSecondChild){
                    let linkToVideo = event.target.parentNode.parentNode.parentNode;
                    let url = linkToVideo.href;
                    let videoID = /\/shorts\//.test(url) ? // NB: short videos has different url
                        url.replace('https://www.youtube.com/shorts/', '') : parseURL(url).v;

                    
                    // find next button element
                    Prism.findElement('.ytp-miniplayer-controls a.ytp-next-button.ytp-button').modify(nextButton => {
                        Prism.findElement('ytd-playlist-panel-renderer#playlist #items').modify(playlist => {
                            // NB!: The button does not appear instantly in the DOM tree, 
                            // a mutation based method to determine when this node appeared in the tree 
                            Prism.detectDOMMutation(playlist, 'ytd-playlist-panel-video-renderer').then(mutationResult => {
                                    // add new video to Prism.playlist
                                    Prism.playlist.add(videoID, mutationResult);

                                    // when we add new video to playlist
                                    // it means that we can unhide button
                                    // but only if is not first video
                                    if(Prism.playlist.IDs.length > 1) Prism.html.nextVideoButton.show(nextButton);

                                    // add event listener and handler to new element
                                    mutationResult.addEventListener('click', function(){
                                        Prism.html.nextVideoButton.toggle(nextButton, parseURL(mutationResult.children[0].href).v);
                                    });
                            });                   
                        });
                    });
                }
            });
        });

        // mini playlist modification
        Prism.findElement('ytd-miniplayer ytd-playlist-panel-video-renderer').modify(playlistVideo => {
            // If playist exist, parse all videos from it
            Prism.playlist.parse(playlistVideo.parentNode);


            Prism.findElement('.ytp-miniplayer-controls a.ytp-next-button.ytp-button').modify(nextButton => {
                Prism.detectAttrMutation(nextButton, 'href', element => {return element.href.length > 0})
                     .then(nextButton => {
                        Prism.html.nextVideoButton.toggle(nextButton);     
                        
                        // if user clicked next video button, check if next video is last video
                        nextButton.addEventListener("click", () => {
                            Prism.html.nextVideoButton.toggle(nextButton)
                        });

                        // if user clicked prev video
                        Prism.findElement('.ytp-miniplayer-controls a.ytp-prev-button.ytp-button').modify(prevButton => {
                            prevButton.addEventListener("click", () => {
                                // check is not replay mode (prev button href must be not empty)
                                // and if is TRULY not replay mode - unhide next video button*
                                // *because all prev links not linked with related video...
                                // ...we can unhide next video button
                                if(prevButton.href.length > 0) {
                                    Prism.html.nextVideoButton.show(nextButton);
                                }
                            });
                        });

                        // if user just play other video, get current url from playlist, and toggle button
                        Prism.playlist.nodes.forEach(node => {
                            node.addEventListener("click", () => {
                                Prism.html.nextVideoButton.toggle(nextButton, parseURL(node.children[0].href).v);
                            });
                        });
                     });
            });
        });

        Prism.findElement('yt-confirm-dialog-renderer yt-button-renderer:last-child').modify(closeButton => {
            closeButton.addEventListener('click', function(){
                Prism.playlist.toClear();
            });
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
            // If playist exist, parse all videos from it
            Prism.playlist.parse(playlistVideo.parentNode);


            Prism.findElement('.ytp-left-controls a.ytp-next-button.ytp-button').modify(nextButton => {
                Prism.detectAttrMutation(nextButton, 'href', element => {return element.href.length > 0})
                     .then(nextButton => {
                        Prism.html.nextVideoButton.toggle(nextButton);     
                        
                        // if user clicked next video button, check if next video is last video
                        nextButton.addEventListener("click", () => {
                            Prism.html.nextVideoButton.toggle(nextButton)
                        });

                        // if user clicked prev video
                        Prism.findElement('.ytp-left-controls a.ytp-prev-button.ytp-button').modify(prevButton => {
                            prevButton.addEventListener("click", () => {
                                // check is not replay mode (prev button href must be not empty)
                                // and if is TRULY not replay mode - unhide next video button*
                                // *because all prev links not linked with related video...
                                // ...we can unhide next video button
                                if(prevButton.href.length > 0) {
                                    Prism.html.nextVideoButton.show(nextButton);
                                }
                            });
                        });

                        // if user just play other video, get current url from playlist, and toggle button
                        Prism.playlist.nodes.forEach(node => {
                            node.addEventListener("click", () => {
                                Prism.html.nextVideoButton.toggle(nextButton, parseURL(node.children[0].href).v);
                            });
                        });
                     });
            });
        });


        Prism.findElement('#primary #player-container .html5-endscreen.ytp-player-content.videowall-endscreen').modify(endScreen => {
            let previous = endScreen.children[0];
            let content = endScreen.children[1];
            let next = endScreen.children[2];

            if(content){
                Prism.detectDOMMutation(content, 'a').then(mutationResult => {
                    content.remove();
                });
            }

            if(previous && next){
                previous.remove();
                next.remove();
            }
        });

        // Removing the most distractive feature - realted videos >:}
        Prism.findElement('#secondary #related').modify(related => {
            related.remove();
        });
    });
});