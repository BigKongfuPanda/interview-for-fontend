// https://github.com/mqyqingfeng/Blog/issues/12

/**
 * bind() 方法会创建一个新函数。当这个新函数被调用时，bind() 的第一个参数将作为它运行时的 this，之后的一序列参数将会在传递的实参前传入作为它的参数。(来自于 MDN )
 * bind 函数有三个特点：
 * 1. 返回一个新函数
 * 2. 可以传入参数
 * 3. 对新函数进行实例化的时候，将原函数作为构造器，bind 提供的 this 会被忽略，
 */
Function.prototype._bind = function(context) {
  // 获取被绑定的函数
  const self = this;
  // 获取_bind 函数的参数，从第二个开始
  const bindArgs = Array.prototype.slice.call(arguments, 1);
  
  // 定义新函数
  function newFun() {
    // 获取新函数的参数
    const args = Array.prototype.slice.call(arguments);
    // 使用apply将context指向被绑定函数的this。
    // 当作为构造函数时，this 指向实例，此时结果为 true，将绑定函数的 this 指向该实例，可以让实例获得来自绑定函数的值
    // 以上面的是 demo 为例，如果改成 `this instanceof fBound ? null : context`，实例只是一个空对象，将 null 改成 this ，实例会具有 habit 属性
    // 当作为普通函数时，this 指向 window，此时结果为 false，将绑定函数的 this 指向 context
    return self.apply(this instanceof newFun ? this : context, bindArgs.concat(args));
  }

  // 修改返回函数的 prototype 为绑定函数的 prototype，实例就可以继承绑定函数的原型中的值
  newFun.prototype = self.prototype;

  // 返回一个新函数
  return newFun;
}
