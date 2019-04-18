/**
 * 思路：跟栈不一样，将队列a的项目导入到队列b中，项目中队列中的排列顺序是一样的。所以完全使用“两个栈实现一个队列”的思路行不通。假设元素都push到队列a中了，此时需要pop出最后一个被添加的元素，而最后一个元素在队列的尾部，无法直接取出。可以这样做，将队列a中的元素导入到队列b中，当a中仅剩一个元素的时候，这时可以使用队列的dequeue方法取出这个元素，这个就为最后一个被添加的元素。
 */

 class Stack {
   constructor() {
    this.queue1 = new Queue();
    this.queue2 = new Queue();
    this.dataQueue = null; // 定义一个存放数据的队列
    this.emptyQueue = null; // 定义一个备份数据的队列
   }

   // 初始化队列数据，模拟私有方法 确认哪个队列存放数据，哪个队列做备份
   _initStack() {
    if (this.queue1.isEmpty()) {
      this.dataQueue = this.queue2;
      this.emptyQueue = this.queue1;
    } else {
      this.dataQueue = this.queue1;
      this.emptyQueue = this.queue2;
    }
   }

   push(item) {
    this._initStack();
    this.dataQueue.push(item);
   }

   pop() {
    this._initStack();
    // 留下最后一个元素，此时这个元素即是队首，又是队尾，可以使用 dequeue 方法取出
    while(this.dataQueue.size() > 1) {
      // 利用备份队列转移数据，数据队列和备份队列交换了身份
      this.emptyQueue.push(this.dataQueue.dequeue());
    }
    return this.dataQueue.dequeue();
   }
 }
