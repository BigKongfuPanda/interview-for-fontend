// 参考资料 https://juejin.im/post/5b83cb5ae51d4538cc3ec354, https://juejin.im/post/5cbafea5e51d456e4f4d2a09

const PENDING = 'PENDING';
const FULLFILLED = 'FULLFILLED';
const REJECTED = 'REJECTED';

function isFunction(fn) {
  return Object.prototype.toString.call(fn) === '[object Function]';
}

class MyPromise {
  constructor(handle) {
    if (!isFunction(handle)) {
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

  /**
   * 当 resolve 或 reject 方法执行时，我们依次提取成功或失败任务队列当中的函数开始执行，并清空队列，从而实现 then 方法的多次调用
   * 还有一种特殊的情况，就是当 resolve 方法传入的参数为一个 Promise 对象时，则该 Promise 对象状态决定当前 Promise 对象的状态。
   * @param {*} val 
   */

  // 添加resolve 执行函数
  _resolve(val) {
    if (this._status !== PENDING) {
      return;
    }
    const run = () => {
      // 依次执行成功队列中的函数，并清空队列
      const runFullfilled = (value) => {
        this._fullfilledQueues.forEach(cb => cb());
        this._fullfilledQueues.length = 0;
      }
      // 一次执行失败队列中的函数，并清空队列
      const runRejected = (value) => {
        this._rejectedQueues.forEach(cb => cb());
        this._rejectedQueues.length = 0;
      }

      /**
       * 如果 resolve 的参数为 promise, 必须等待该 promise 对象的状态改变之后，当前 promise 的状态才能改变，且状态取决于参数 promise 对象的状态
       */
      if (val instanceof MyPromise) {
        val.then((value) => {
          this._value = value;
          this._status = FULLFILLED;
          runFullfilled(value);
        }, (error) => {
          this._value = error;
          this._status = REJECTED;
          runRejected(error);
        });
      } else {
        this._value = val;
        this._status = FULLFILLED;
        runFullfilled(val);
      }
    }
    // 使用异步，是为了支持同步执行resolve函数，而并非在异步中去执行 resolve 函数的情况。能够保证 then 中的回调函数先添加到回调队列中，然后才执行 resolve。
    setTimeout(run, 0);
  }

  // 添加reject 执行函数
  _reject(error) {
    if (this._status !== PENDING) {
      return;
    }
    const run = () => {
      this._status = REJECTED;
      this._value = val;
      this._rejectedQueues.forEach(cb => {
        cb(error);
      });
    }
    setTimeout(run, 0);
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
      // 封装一个成功时执行的回调
      const fullfilled = (value) => {
        try {
          if (!isFunction(onFullfilled)) {
            // 如果 onFullfilled 不是函数，则直接调用onFullfilledNext，并且将 value 传过去
            onFullfilledNext(value);
          } else {
            // 如果 onFullfilled 是函数，则判断其结果是否为 promise
            let res = onFullfilled(value);
            if (res instanceof MyPromise) {
              // 返回值为 promise，则等待其状态改变之后再调用 onFullfilledNext 和 onRejectedNext
              res.then(onFullfilledNext, onRejectedNext);
            } else {
              //否则会将返回结果直接作为参数，传入下一个then的回调函数，并立即执行下一个then的回调函数
              onFullfilled(res);
            }
          }
        } catch (error) {
          // 如果函数执行出错，新的 promise 对象的状态也为失败
          onRejectedNext(error);
        }
      }
      // 封装一个失败时执行的回调
      const rejected = (error) => {
        try {
          if (!isFunction(onRejected)) {
            onRejectedNext(error);
          } else {
            let res = onRejected(error);
            if (res instanceof MyPromise) {
              res.then(onFullfilledNext, onRejectedNext);
            } else {
              onRejectedNext(res);
            }
          }
        } catch (error) {
          onRejectedNext(error);
        }
      }

      switch (_status) {
        // 当状态为 pending的时候，将 then 方法中的回调添加到执行队列中去等待执行
        case PENDING:
          this._fullfilledQueues.push(onFullfilled);
          this._rejectedQueues.push(onRejected);
          break;
        // 当状态已经改变了，执行对应的回调函数
        case FULLFILLED:
          fullfilled(_value);
          break;
        // 当状态已经改变了，执行对应的回调函数
        case FULLFILLED:
          rejected(_value);
          break;
      }
    });
  }

  // catch 方法：相当于调用 then，将第一个参数置为 null, 只传入第二个参数（onRejected 失败函数）
  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  // finally 方法用于指定不管 Promise 对象最后状态如何，都会执行的操作
  finally(cb) {
    return this.then(
      value => MyPromise.resolve(cb()).then(() => value),
      error => MyPromise.resolve(cb()).then(() => { throw new Error(error) })
    );
  }

  // 静态resolve 方法
  static resolve(value) {
    if (value instanceof MyPromise) {
      return value;
    }
    return new MyPromise(resolve => resolve(value));
  }

  // 静态 reject 方法
  static reject(value) {
    return new MyPromise((undefined, reject) => reject(value));
  }

  // 静态 all 方法
  static all(promises) {
    if (!Array.isArray(promises)) {
      throw new Error('arguments must be an array');
    }
    return new MyPromise((resolve, reject) => {
      let result = [];
      let count = promises.length;
      let i = 0;
      for (const p of promises) {
        this.resolve(p).then(res => {
          result.push(res);
          i++;
          // 所有状态都变成fulfilled时返回的MyPromise状态就变成fulfilled
          if (i === count) {
            resolve(result);
          }
        }, error => {
          // 有一个被rejected时返回的MyPromise状态就变成rejected
          reject(error);
        });
      }
    });
  }

  // 静态 race 方法
  static race(promises) {
    return new MyPromise((resolve, reject) => {
      for (const p of promises) {
        // 只要有一个实例率先改变状态，新的MyPromise的状态就跟着改变
        this.resolve(p).then(res => {
          resolve(res);
        }, error => {
          reject(error);
        });
      }
    });
  }
}

export default MyPromise;