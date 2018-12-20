/**
 * 1. debounce 函数防抖：利用定时器的原理来达到减少函数执行的次数的目的，代码如下
 * debounce 适合与 onresize，onscroll，input输入框的场景。
 * 原理：将若干个函数调用合成为一次，并在给定时间过去之后仅被调用一次。 
 */

function debounce (handle, delay) {
let _timer = null;
  return function() {
    clearTimeout(_timer);
    const _arg = [...arguments];
    _timer = setTimeout(() => {
      handle.apply(this, _arg);
    }, delay);
  }
}

 // 使用案例
function logFunc() {
  console.log(1);
}
window.onresize = debounce(logFunc, 300);

/**
 * 由以上代码可知：当 resize 事件第一次执行的时候，会创建定时器 timer，并将于 300ms 之后执行 logFunc 函数。如果在300ms之内，执行了第二次 resize 事件的话，会将第一次建立的定时器 timer 给清理掉，并重新创建一个 300ms 延时的 定时器 timer，依次类推，若每次连续执行的 onresize 事件的时间间隔在 300ms 以内，则会清理上次的定时器，而建立新的定时器，之前的 logFunc 永远无法执行。当最后一次 onresize 事件执行了，并且 300ms 以内没有再次执行 onresize 事件的时候，logFunc 才会被执行，并且只会执行一次。
 */


/**
 * 2. throttle 函数节流：节流函数不管事件触发有多频繁，都会保证在规定时间内一定会执行一次真正的事件处理函数。并不是只是响应最后一次事件。
 * 使用场景是 无限瀑布流。如果只在用户停止滚动的时候再次加载数据的话，滚动过程中都是空白的，体验不好。
 */

 // 实现方法一：时间戳的实现
function throttle(handle, delay) {
  let prev = Date.now();
  return function() {
    const context = this;
    const args = [...arguments];
    const now = Date.now();
    if(now - prev >= delay) {
      handle.apply(context, args);
      prev = Date.now();
    }
  }
}
/**
 * 当高频事件触发时，第一次应该会立即执行（给事件绑定函数与真正触发事件的间隔如果大于delay的话），而后再怎么频繁触发事件，也都是会每delay秒才执行一次。而当最后一次事件触发完毕后，事件也不会再被执行了。
 */

// 实现方法二：定时器实现
//当触发事件的时候，我们设置一个定时器，再触发事件的时候，如果定时器存在，就不执行；直到delay秒后，定时器执行执行函数，清空定时器，这样就可以设置下个定时器。
function throttle(handle, delay) {
  let timer = null;
  return function() {
    const context = this;
    const args = [...arguments];
    if(!timer) {
      timer = setTimeout(() => {
        handle.apply(context, args);
        timer = null;
      }, delay);
    }
  }
}

/**
 * 当第一次触发事件时，肯定不会立即执行函数，而是在delay秒后才执行。 之后连续不断触发事件，也会每delay秒执行一次。 当最后一次停止触发后，由于定时器的delay延迟，可能还会执行一次函数。
 */