import {elementInView} from './viewportHandler';
import {querySelectorAllCached} from './akademi';

const lazyCache = {};
let lazyCacheList = [];
let imgElements = null;
let allLoaded = false;

function removeEventListeners (el) {
  el.removeEventListener('load', onLoad);
  el.removeEventListener('error', onError);
}

function onLoad (e) {
  e.target.classList.remove('akm-lazy-loading');
  e.target.classList.add('akm-lazy-loaded');
  removeEventListeners(e.target);
}

function onError (e) {
  e.target.classList.remove('akm-lazy-loading');
  e.target.classList.add('akm-lazy-error');
  removeEventListeners(e.target);
}

function updateImages () {
  if (allLoaded) {
    return;
  }

  if (!imgElements) {
    imgElements = querySelectorAllCached('img[data-src]');
  } else {
    if (lazyCacheList.length === imgElements.length) {
      allLoaded = true;
      return;
    }
  }

  const _imgElements = imgElements;

  for (let i = 0; i < _imgElements.length; i++) {
    if (lazyCache[i]) {
      continue;
    }
    const el = _imgElements[i];
    if (!elementInView(el)) {
      continue;
    }
    lazyCache[i] = true;
    lazyCacheList = Object.keys(lazyCache);

    el.addEventListener('load', onLoad);
    el.addEventListener('error', onError);
    el.classList.add('akm-lazy-loading');
    el.src = el.dataset.src;
    delete el.dataset.src;
  }
}

export default {
  updateImages,
};
