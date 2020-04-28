// overwrite the `languages` property to use a custom getter
Object.defineProperty(navigator, "languages", {
  get: function() {
    return ["en-US", "en"];
  }
});
// overwrite the `plugins` property to use a custom getter
Object.defineProperty(navigator, 'plugins', {
  get: function() {
    // this just needs to have `length > 0`, but we could mock the plugins too
    return [1, 2, 3, 4, 5];
  }
});
Object.defineProperty(navigator, 'webdriver', {
  get: () => undefined
});
Object.defineProperty(navigator, 'permissions', {
  get: () => undefined
});

((window, open) => {//useless
  window.open = (url) => {
      open.call(window, url, '_self');
  };
})(window, window.open);

console.log(navigator.userAgent)