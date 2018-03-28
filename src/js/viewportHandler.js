import lazyloader from './lazyload';
import {documentReady} from './akademi';
import {querySelectorAllCached} from './akademi';

let scrollTimeout = null;
function scrollThrottler (e) {
  if (scrollTimeout) {
    return;
  }

  scrollTimeout = setTimeout(() => {
    scrollTimeout = null;
    scrollHandler(e);
  }, 25);
}

let resizeTimeout = null;
function resizeThrottler (e) {
  if (resizeTimeout) {
    return;
  }

  resizeTimeout = setTimeout(() => {
    resizeTimeout = null;
    onViewportChanged();
  }, 33);
}

function resizeHandler (e) {
  onViewportChanged();
}

export let scrollTop = -1;
function scrollHandler (e) {
  scrollTop = getScrollElement().scrollTop;
  onViewportChanged();
}

function onViewportChanged () {
  updateAppear();
  lazyloader.updateImages();
}

export function elementInView (el, bufferZone) {
  bufferZone = bufferZone || 0;
  const rect = el.getBoundingClientRect();

  return (
    rect.bottom + bufferZone >= 0 &&
    rect.top - bufferZone <=
      (window.innerHeight || document.documentElement.clientHeight)
  );
}

const appearCache = {};
function updateAppear () {
  const appearElements = querySelectorAllCached('.akm-appear');
  for (let i = 0; i < appearElements.length; i++) {
    if (appearCache[i]) {
      continue;
    }
    const el = appearElements[i];
    if (!elementInView(el)) {
      continue;
    }
    appearCache[i] = true;
    el.addEventListener('transitionend', (e) => {
      el.classList.remove('akm-appear-appearing');
      el.classList.add('akm-appear-appeared');
    });
    el.classList.add('akm-appear-appearing');
    if (el.classList.contains('akm-appear-appear-notify')) {
      el.dispatchEvent(new Event('akm-appeared'));
    }
  }
}

export function easeInOut (currentTime, start, change, duration) {
  currentTime /= duration / 2;
  if (currentTime < 1) {
      return change / 2 * currentTime * currentTime + start;
  }

  currentTime -= 1;
  return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
}

export function getScrollElement () {
  return document.documentElement && typeof document.documentElement.scrollTop
    !== 'undefined' ? document.documentElement : document.body;
}

export function scrollTo (to, speed) {
  const element = getScrollElement();
  const start = element.scrollTop;
  const change = to - start;
  const increment = 20;
  const duration = Math.abs(change / speed * 300);

  const animateScroll = function (elapsedTime, cb) {
    elapsedTime += increment;
    const position = easeInOut(elapsedTime, start, change,
      duration);
    element.scrollTop = position;
    if (elapsedTime < duration) {
      setTimeout(function () {
        animateScroll(elapsedTime, cb);
      }, increment);
    } else {
      cb();
    }
  };

  return new Promise((resolve, reject) => {
    animateScroll(0, resolve);
  });
}

function setupListeners () {
  window.addEventListener('scroll', scrollThrottler);
  window.addEventListener('resize', resizeThrottler);
}

function initialize () {
  setupListeners();
  setTimeout(resizeHandler, 100);

  return {
    elementInView,
    easeInOut,
    scrollTo,
    getScrollElement,
  };
}

documentReady(() => {
  initialize();
});
