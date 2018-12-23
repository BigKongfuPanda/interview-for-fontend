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