String.prototype.replaceAll = function (target, replacement) {
  return this.split(target).join(replacement);
};

const querySelectorCache = {};
const querySelectorAllCache = {};

export function querySelectorCached (query) {
  if (!querySelectorCache[query]) {
    querySelectorCache[query] = document.querySelector(query);
  }

  return querySelectorCache[query];
}

export function querySelectorAllCached (query) {
  if (!querySelectorAllCache[query]) {
    querySelectorAllCache[query] = Array.from(document.querySelectorAll(query));
  }

  return querySelectorAllCache[query];
}

export function setVendorStyle (element, property, value) {
  element.style['webkit' + property] = value;
  element.style['moz' + property] = value;
  element.style['ms' + property] = value;
  element.style['o' + property] = value;
}

export function documentReady (cb) {
  if (document.readyState !== 'loading') {
    cb();
  } else {
    document.addEventListener('DOMContentLoaded', cb);
  }
}
