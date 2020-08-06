/**
 * Wraps the given function, `fn`, with a new function that only invokes `fn`
 * at most once per every `wait` milliseconds.
 *
 * @function
 * @param    {Function} fn
 *           The function to be throttled.
 *
 * @param    {number}   wait
 *           The number of milliseconds by which to throttle.
 *
 * @return   {Function}
 */

function throttle(fn, wait) {
  let last = window.performance.now();

  const throttled = function(...args) {
    const now = window.performance.now();

    if (now - last >= wait) {
      fn(...args);
      last = now;
    }
  };

  return throttled;
}

export { throttle };
