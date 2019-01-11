

// curry 函数的简单实现
function Curry(fn) {
  const args = Array.prototype.slice.call(arguments, 1);
  return function() {
    const _args = [...arguments];
    const totalArgs = args.concat(_args);
    return fn.apply(null, totalArgs);
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
