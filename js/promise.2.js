/**
 * 如果要支持链式 .then，则需要将 then 中参数放入数组中存储，同时，如果 task 函数中的操作是同步的，则因为 resolve 比 then 先执行，则此时数组为空，故需要使用 nextTick 函数来包裹 resolve函数，或者使用 setTimeout。
 * 另外，为了支持链式 .then，需要在 then 函数中返回当前 _promise 实例对象
 */

class _Promise {
  // task: 实例化时传给Promise构造函数的参数，为函数类型
  constructor(task) {
    task(this._resolve.bind(this), this._rejected.bind(this));
    this.sucessCbs = [];
    this.failCbs = [];
  }

  // data：传递给 onFullFilled 的参数
  _resolve(data) {
    setTimeout(() => {
      this.sucessCbs.forEach(cb => {
        cb(data);
      });
    }, 0);
  }

  // data：传递给 onRejected 的参数
  _rejected(data) {
    this.failCbs.forEach(cb => {
      cb(data);
    })
  }

  then(onFullFilled, onRejected){
    this.sucessCbs.push(onFullFilled);
    this.failCbs.push(onRejected);
    return this;
  }
}

// 测试例子
function ajax(num) {
  return new _Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(num);
    }, 1000);
  });
}

ajax(1)
.then(res => {
  console.log(res);
  ajax(2);
})
.then(_res => {
  console.log(_res);
})
// 输出结果为： 1, 1。期待中的结果应该为 1, 2。
/**
 * 原因分析：两次执行 then 函数的时候，将 res => {console.log(res)} 和 _res => {console.log(_res)} 添加到数组 sucessCbs 中。执行 _resolve() 函数的时候，传入的参数为 第一个 ajax的参数 1，所以两次输出的结果为 1， 1
 */