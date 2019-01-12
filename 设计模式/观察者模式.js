//http://www.runoob.com/design-pattern/observer-pattern.html

/**
 * 用途：定义对象中的一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都得到通知并被自动更新
 * 优点：1. 观察者和被观察者是抽象耦合的，2.建立一套触发机制
 * 缺点：1. 如果被观察者非常多的时候，每次通知和更新会很耗费时间。2、观察者模式没有相应的机制让观察者知道所观察的目标对象是怎么发生变化的，而仅仅只是知道观察目标发生了变化。
 * 实现：观察者模式存在两个类 Subject, Observer。Subject 构造器中存在一个数组，用于存放依赖于当前被观察者的所有观察者，同时，Subject 类中还存在两个方法，一个用来添加依赖，一个用来通知依赖进行更新。Observer 类中存在一个更新的方法，同时还能够将自己添加到被观察者的依赖中去
 */

 // 被观察者类
class Subject {
  constructor() {
    // 存放依赖的集合
    this.observers = [];
  }

  // 添加依赖
  attach(observer) {
    if (observer && !this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  // 通知依赖进行更新
  notify() {
    this.observers.forEach(observer => observer.update());
  }
}

// 观察者类
class Observer {
  constructor(subject) {
    // subject 为被观察者实例对象
    this.subject = subject;
    // 将自己添加到subject 的依赖集合中去
    this.subject.attach(this);
  }

  // 进行更新
  update() {
    console.log('更新了');
  }
}

const subject = new Subject();
const observer1 = new Observer(subject);
const observer2 = new Observer(subject);
const observer3 = new Observer(subject);

subject.notify();


// vue 中观察者模式
const data = {
  price: 5,
  quantity: 2
};
let target = null;

// 被观察者
class Dep {
  constructor() {
    // 观察者的集合
    this.subscribers = [];
  }

  // 将观察者添加到集合中
  depend() {
    if (target && !this.subscribers.includes(target)) {
      this.subscribers.push(target);
    }
  }

  // 当被观察者发生变化的时候，通知观察者去进行进行更新
  notify() {
    this.subscribers.forEach(sub => sub());
  }
}

Object.keys(data).forEach(key => {
  let internalValue = data[key];
  const dep = new Dep();
  Object.defineProperty(data, key, {
    get() {
      dep.depend();
      return internalValue;
    },
    set(newVal) {
      internalValue = newVal;
      dep.notify();
    }
  })
});

function watcher(myFun) {
  target = myFun;
  // 此时会出发 get 函数，进而触发 dep.depend() ，从而将 myFun 这个观察者添加到了subscribers集合中
  target(); 
  target = null;
}
watcher(() => {
  data.total = data.price * data.quantity;
});