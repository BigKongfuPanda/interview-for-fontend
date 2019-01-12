/**
 * https://www.jianshu.com/p/f0f22398d25d
 * https://www.cnblogs.com/lovesong/p/5272752.html
 * https://blog.csdn.net/it_rod/article/details/79516578
 * 事件发布订阅模式中，最常见的就是 node 中的 EventEmiter
 */

// 1. EventEmiter 的简单实现，还有remove, once 方法待补充

class EventEmiter {
  constructor() {
    this.listener = new Map();
  }

  on(type, handler) {
    // 此处省略了 type, handler 等参数的判断

    const subs = this.listener.get(type);

    if (!subs) {
      this.listener.set(type, [handler]);
    } else {
      subs.push(handler);
    }
  }

  emit(type) {
    // 此处省略了 type 参数的判断
    
    const args = Array.prototype.slice.call(arguments, 1);
    const subs = this.listener.get(type);
    subs && subs.forEach(handler => {
      handler(...args);
    });
  }
}

// 测试
const eventEmiter = new EventEmiter();
eventEmiter.on('click', counter => {
  console.log(counter);
});
eventEmiter.emit('click', 1); // 1