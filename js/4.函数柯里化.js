

// curry 函数的简单实现
function Curry(fn) {
  const currArgs = Array.prototype.slice.call(arguments, 1);
  const len = fn.length;
  return function() {
    const args = [...currArgs, ...arguments]
    if (totalArgs.length < len) {
      return Curry(fn, args)
    } else {
      return fn.apply(null, args);
    }
  }
}

function doSomething(do, something) {
  console.log(do + ',' + something);
}

//没有使用 curry, 如果同时对多个人说 hello, 每次都需要传入相同的参数 'hello' 
doSomething('hello', 'john');
doSomething('hello', 'tom');
doSomething('hello', 'jack');

// 使用 curry, 在多次调用同一个函数并且输入的部分参数总是一样的时候 ，就能够减少重复输入
const newDoSomething = Curry(doSomething, 'hello');
newDoSomething('john');
newDoSomething('tom');
newDoSomething('jack');

// 实现一个add方法，使计算结果能够满足如下预期：
add(1)(2)(3) = 6;
add(1, 2, 3)(4) = 10;
add(1)(2)(3)(4)(5) = 15;

function add() {
    // 第一次执行时，定义一个数组专门用来存储所有的参数
    var _args = Array.prototype.slice.call(arguments);

    // 在内部声明一个函数，利用闭包的特性保存_args并收集所有的参数值
    var _adder = function() {
        _args.push(...arguments);
        return _adder;
    };

    // 利用toString隐式转换的特性，当最后执行时隐式转换，并计算最终的值返回
    _adder.toString = function () {
        return _args.reduce(function (a, b) {
            return a + b;
        });
    }
    return _adder;
}

add(1)(2)(3)                // 6
add(1, 2, 3)(4)             // 10
add(1)(2)(3)(4)(5)          // 15
add(2, 6)(1)     


//普通函数
function fn(a,b,c,d,e) {
  return a + b + c + d + e;
}
//生成的柯里化函数
let _fn = curry(fn);

_fn(1,2,3,4,5);     // print: 1,2,3,4,5
_fn(1)(2)(3,4,5);   // print: 1,2,3,4,5
_fn(1,2)(3,4)(5);   // print: 1,2,3,4,5
_fn(1)(2)(3)(4)(5); // print: 1,2,3,4,5

function curry3(fn, args) {
  const len = fn.length;
  let args = args || []
  return function() {
    const newArgs = [...args, ...arguments]
    if (newArgs.length < len) {
      return curry3.call(this, fn, newArgs)
    } else {
      return fn.apply(this, newArgs)
    }
  }
}