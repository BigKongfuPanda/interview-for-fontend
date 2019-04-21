const PENDING = 'PENDING';
const FULLFILLED = 'FULLFILLED';
const REJECTED = 'REJECTED';

class MyPromise {
  constructor(handle) {
    if (typeof handle) {
      throw new Error('handle must be a function');
    }
    // 添加状态
    this._status = PENDING;
    // 添加值
    this._value = undefined;
    // 添加 then 中 成功回调函数的函数队列
    this._fullfilledQueues = [];
    // 添加 then 中 失败回调函数的函数队列
    this._rejectedQueues = [];
    // 执行 handle
    try {
      handle(this._resolve.bind(this), this._reject.bind(this));
    } catch (error) {
      this._reject(error);
    }
  }

  // 添加resolve 执行函数
  _resolve(val) {
    if (this._status !== PENDING) {
      return;
    }
    this._status = FULLFILLED;
    this._value = val;
  }

  // 添加reject 执行函数
  _reject(error) {
    if (this._status !== PENDING) {
      return;
    }
    this._status = REJECTED;
    this._value = error;
  }

  // 添加 then 方法
  /**
   * 
   * @param {*} onFullfilled 
   * @param {*} onRejected 
   * 
   * 这里涉及到 Promise 的执行规则，包括“值的传递”和“错误捕获”机制：
   * 1、如果 onFulfilled 或者 onRejected 是函数，并且返回一个值 x ，则运行下面的 Promise 解决过程：
   *   1.1 若 x 不为 promise , 则立即执行新 promise 的 onFulfilled 或 onRejected 方法，并且参数为 x;
   *   1.2 若 x 为 promise, 则 应该等待 x 的状态发生改变之后，再执行 新 promise 的 onFulfilled 或 onRejected 方法，并且新的 promise 的状态与 x 的状态是一样。
   * 2. 如果 onFulfilled 或者 onRejected 是函数，并且在执行的时候抛出异常 e, 则新的 promise 必须也要变为失败状态(rejected)，并返回失败的值 e
   * 3. 如果 onFulfilled 不是函数，且 x 的状态为成功（fullfilled），新的 promise 的状态必须为成功（fullfilled）,且返回新 promise 的值
   * 4. 如果 onRejected 不是函数，且 x 的状态为失败（rejected），新的 promise 的状态必须为失败（rejected），且返回新 promise 的值
   */
  then(onFullfilled, onRejected) {
    const { _value, _status } = this;
    // 返回一个新的 promise 对象
    return new MyPromise((onFullfilledNext, onRejectedNext) => {
      // 需要判断 then 中




      switch (_status) {
        // 当状态为 pending的时候，将 then 方法中的回调添加到执行队列中去等待执行
        case PENDING:
          this._fullfilledQueues.push(onFullfilled);
          this._rejectedQueues.push(onRejected);
          break;
        // 当状态已经改变了，执行对应的回调函数
        case FULLFILLED:
          onFullfilled(_value);
          break;
        // 当状态已经改变了，执行对应的回调函数
        case FULLFILLED:
          onRejected(_value);
          break;
      }
    });
  }
}