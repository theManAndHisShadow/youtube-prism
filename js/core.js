
function preventMainPageLoading(){
    let path = document.location.pathname;

    if(path === "/") {
        let url_redirect = document.createElement("a");
        url_redirect.href = "https://www.youtube.com/feed/subscriptions";

        url_redirect.click();
    }
}

preventMainPageLoading();