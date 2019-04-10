// https://github.com/mqyqingfeng/Blog/issues/11

/**
 * call() 方法在使用一个指定的 this 值和若干个指定的参数值的前提下调用某个函数或方法。
 * 1.this 参数可以传 null，当为 null 的时候，视为指向 window
 * 2.函数是可以有返回值的！
 */
Function.prototype._call = function(context) {
  const context = context || window;
  const args = [...arguments].slice(1);
  // 生成一个唯一的key
  const symbol = Symbol();
  context[symbol] = this;
  const result = context[symbol](...args);
  delete context[symbol];
  return result;
}

Function.prototype._apply = function(context, arr) {
  const context = context || window;
  let result;
  // 生成一个唯一的key
  const symbol = Symbol();
  context[symbol] = this;

  if(!arr) {
    result = context[symbol]();
  } else {
    result = context[symbol](...arr);
  }
  delete context[symbol];
  return result;
}