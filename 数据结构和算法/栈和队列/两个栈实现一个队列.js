/**
 * 思路：首先明确概念：栈是先进后出，有push和pop方法。队列是先进先出，队首进，队尾出
 * 定义两个栈 stack1 和 stack2。进队时，往stack1中push，出队时或者获取队列中第一个元素的时候，此时第一个元素在 stack1 的底部，暂时取不出来，所以先将 stack1 中的元素都 push到 stack2 中，这样队列的第一个元素就在 stack2的顶部了
 */

class Queue {
  constructor() {
    this.stack1 = new Stack();
    this.stack2 = new Stack();
  }

  _initQueue() {
    if (this.stack1.isEmpty() && this.stack2.isEmpty()) {
      return null; // 如果两个栈都是空的，那么队列中就没有元素
    }
    if (this.stack2.isEmpty()) {
      while (!this.stack1.isEmpty()) {
        this.stack2.push(this.stack1.pop());
      }
    }
  }

  // 入队
  enqueue(item) {
    this.stack1.push(item);
  }

  // 出队
  dequeue() {
    this._initQueue();
    return this.stack2.pop();
  }

  // 获取第一个元素
  head() {
    this._initQueue();
    return this.stack2.pop();
  }
}
