import PageCheck from './pageCheck';
import Subscribers from './subscribers';
import { isNode } from './util';
import ChatObserver from './chatObserver';

export const DISALLOWED_CHARS = ['\\', ':', '/', '&', "'", '"', '?', '!', '#'],
             SCROLL_ENABLED_URL =  chrome.extension.getURL('icons/scroll-enabled.png'),
             SCROLL_DISABLED_URL =  chrome.extension.getURL('icons/scroll-disabled.png');

export let options = null;

export function getOptions() {
    if (options === null) {
        return JSON.parse(localStorage.getItem('optionsCache'));
    }

    return options;
}

const onNewPageLoad = function() {

    $('[class^="iptv-"]').remove();

    if (getOptions()['redirectToYTGaming'] === true) {
        setTimeout(PageCheck.youtubeGaming, 2500);
    }

    $('.yt-live-chat-header-renderer#title').text('Chat');

    PageCheck.livestreamPage();
};

(function() {

    const target = document.querySelector('head > title');

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function() {
            onNewPageLoad();
        });
    });

    if (!isNode(target)) {
        return;
    }

    observer.observe(target, { subtree: true, characterData: true, childList: true });
}());

setTimeout(function() {
    chrome.runtime.sendMessage('requestSubscriptions', function(response) {

        console.log(response);

        options['subscriptions'] = response;
    });
}, 5000);

chrome.runtime.sendMessage('requestLocalstorage', function(response) {

    options = response;

    localStorage.setItem('optionsCache', JSON.stringify(options));

    console.log('@options:', options);

    if (getOptions()['enableChatColors']) {
        const a = chrome.extension.getURL('external/chat-colors.css');
        $('<link rel="stylesheet" type="text/css" href="' + a + '" >').appendTo('head');
    }

    if (getOptions()['disableAvatars'] === true) {
        $('<style type="text/css">.style-scope .yt-live-chat-item-list-renderer #author-photo { width: 0px; height: 0px; margin-right: 0px; visibility: hidden; }.style-scope.yt-live-chat-message-input-renderer.no-transition{ display: none !important; }.style-scope yt-live-chat-message-input-renderer #avatar { display: none !important;margin:0 !important; }</style>').appendTo('head');
    }

    if (getOptions()['enableSplitChat'] === true) {
        $('<style type="text/css">.style-scope yt-live-chat-text-message-renderer { border-top: 0.5px solid #333333; border-bottom: 0.5px solid #000000; }</style>').appendTo('head');
    }

    if(getOptions()['showDeletedMessages'] === true) {
        $('<style type="text/css">.yt-live-chat-text-message-renderer-0[is-deleted]:not([show-original]) #message.yt-live-chat-text-message-renderer {display: inline;} .yt-live-chat-text-message-renderer-0 #deleted-state.yt-live-chat-text-message-renderer { color: rgba(255, 255, 255, 0.25); } .yt-live-chat-text-message-renderer-0[is-deleted]:not([show-original]) #message.yt-live-chat-text-message-renderer { color: rgba(255, 255, 255, 0.25); } .yt-live-chat-text-message-renderer-0 #deleted-state:before{content: "  "}</style>').appendTo('head');
    }

    if(getOptions()['mentionHighlight'] === true) {
        $('<style type="text/css">.yt-live-chat-text-message-renderer-0 .mention.yt-live-chat-text-message-renderer { background-color: rgba(114, 15, 15, 0) !important; padding: 0px 0px !important; }</style>').appendTo('head');
    }

    console.log($('.yt-live-chat-header-renderer-0').css('background-color'));

    const chatColor = $('.yt-live-chat-header-renderer-0').css('background-color');
    if (chatColor === 'rgb(40, 40, 40)') {
        $('<style type="text/css">.yt-live-chat-text-message-renderer-0[author-type=moderator]{background-color:#282828}</style>').appendTo('head');
    } else if (chatColor === 'rgba(238, 238, 238, 0.4)') {
        $('<style type="text/css">.yt-live-chat-text-message-renderer-0[author-type=moderator]{background-color:#e2e2e2}</style>').appendTo('head');
    }

    onNewPageLoad();
});

Subscribers.loadBadges();

if (getOptions()['emotesTwitch'] === true || getOptions()['emotesSub'] === true || getOptions()['emotesBTTV'] === true || getOptions()['emotesIce'] === true) {
    ChatObserver();
}
