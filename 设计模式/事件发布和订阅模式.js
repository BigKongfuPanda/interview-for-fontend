/**
 * https://www.jianshu.com/p/f0f22398d25d
 * https://www.cnblogs.com/lovesong/p/5272752.html
 * https://blog.csdn.net/it_rod/article/details/79516578
 * 事件发布订阅模式中，最常见的就是 node 中的 EventEmiter
 * 
 * 发布订阅模式 跟 观察者模式 特别相似。最大的区别在于，观察者模式中，被观察者和观察者之间是直接通信的，而发布订阅模式，发布者和订阅者之间是解耦的，中间有一个消息传递中心。
 */

// 1. EventEmiter 的简单实现，还有remove, once 方法待补充

class EventEmiter {
  constructor() {
    this.events = new Map();
  }

  on(type, listener) {
    // 此处省略了 type, listener 等参数的判断

    const subs = this.events.get(type);

    if (!subs) {
      this.events.set(type, [listener]);
    } else {
      subs.push(listener);
    }

    return this;
  }

  // once 的简单实现，源码更复杂。
  // 为指定事件注册一个单次监听器，即 监听器最多只会触发一次，触发后立刻解除该监听器。
  once(type, listener) {
    const onceWrap = () => {
      listener.apply(this, arguments);
      this.off(type, onceWrap);
    }
    this.on(type, onceWrap);
    // 由于on上面注册的是 onceWrap 监听器，而与 once 注册的 listener 监听器不是同一个函数，所以需要保存一下 listener 监听器，作为 去除的时候用。
    onceWrap.listener = listener;
  }

  // 触发的顺序是按照注册的先后顺序来的。即先注册先触发
  emit(type) {
    // 此处省略了 type 参数的判断
    
    const args = Array.prototype.slice.call(arguments, 1);
    const subs = this.events.get(type);
    subs && subs.forEach(listener => {
      listener.call(this, ...args);
    });

    return this;
  }

  // 移除指定事件的某个监听器，监听器必须是该事件已经注册过的监听器。如果同一个listener 被注册了多次，则每次只会去除最近被注册的那个listener
  off(type, listener) {
    const subs = this.events.get(type);
    // 此处的 listener.listener，是为了处理 once 注册的情况
    subs.splice(listener || listener.listener, 1);

    return this;
  }

  // 移除所有事件的监听器，如果指定事件，则移除指定事件的所有监听器
  removeAllListeners(type) {
    if(!type) {
      this.events = {};
    } else {
      this.events.set(type, []);
    }

    return this;
  }
}

// 测试
const eventEmiter = new EventEmiter();
eventEmiter.on('click', counter => {
  console.log(counter);
});
eventEmiter.emit('click', 1); // 1

class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(type, listener) {
    const listeners = this.events.get(type);
    if (!listeners) {
      this.events.set(type, [listener]);
    } else {
      listeners.push(listener);
    }
    return this;
  }

  emit(type) {
    const listeners = this.events.get(type);
    const args = [...arguments];
    listeners.forEach(listener => {
      listener.apply(this, args);
    });
    return this;
  }

  off(type, listener) {
    const listeners = this.events.get(type);
    const lastIndex = this.events.lastIndexOf(listener)
    if (lastIndex > -1) {
      listeners.splice(lastIndex, 1);
    }
  }

  removeAllListeners(type) {
    if (!type) {
      this.events = new Map();
    } else {
      this.events.set(type, []);
    }
  }
}