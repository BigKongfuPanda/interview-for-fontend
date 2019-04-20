class _Promise {
  // task: 实例化时传给Promise构造函数的参数，为函数类型
  constructor(task) {
    task(this._resolve.bind(this), this._rejected.bind(this));
    this.sucessCb = null;
    this.failCb = null;
  }

  // data：传递给 onFullFilled 的参数
  _resolve(data) {
    this.sucessCb(data)
  }

  // data：传递给 onRejected 的参数
  _rejected(data) {
    this.failCb(data)
  }

  then(onFullFilled, onRejected){
    this.sucessCb = onFullFilled;
    this.failCb = onRejected;
  }
}

new _Promise((resolve, reject) => {
  console.log('开始');
  setTimeout(() => {
    // resolve('resolve')
    reject('err')
  }, 5000)
}).then(res => {
  // console.log(res);
}, err => {
  console.log(err);
});

// Promise.all 实现
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('arguments must be an array'));
    }
    let resolvedCounter = 0;
    let promiseNum = promises.length;
    let result = [];

    promises.forEach(promise => {
      Promise.resolve(promise).then(function resolvedHandler(value) {
        resolvedCounter++;
        result.push(value);
        if (promiseNum === resolvedCounter) {
          return resolve(result);
        }
      }, function rejectedHandler(reason) {
        return reject(reason);
      });
    });
  });
}

// 试验：
let p1 = Promise.resolve(1);
let p2 = Promise.resolve(2);

promiseAll([p1, p2]).then(result => console.log(result));
// [1, 2]
