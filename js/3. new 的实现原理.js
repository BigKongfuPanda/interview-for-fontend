// https://github.com/mqyqingfeng/Blog/issues/13

/**
 * new 运算符创建一个用户定义的对象类型的实例或具有构造函数的内置对象类型之一。
 * 1，构造函数内部的 this 在实例化的时候，指向实例对象，并且this的属性都绑定到实例对象上
 * 2，return：【1】构造函数没有 return 时候，则返回实例对象；【2】return 后面是一个Object类型 或者Array的对象（比如名称为 obj），则返回这个对象（obj）；【3】return 后面是基本数据类型或者 null，则返回实例对象
 */

function Person(name) {
  this.name = name;
}

Person.prototype.go = function() {
  console.log(this.name);
};

function objectFactory(fn, ...args) {
  // 创建一个新对象 obj
  const obj = new Object();
  // 使得 obj 继承于 构造函数 fn
  obj.__proto__ = fn.prototype;
  // 利用apply将 obj 指向 fn 内部的this，并且获取 fn 的返回值
  const ret = fn.apply(obj, args);
  // 判断 返回值 ret，如果是 obj 类型，则返回 ret , 否则返回新对象 obj。注意， typeof null === 'object'，此时要返回obj
  return typeof ret === 'object' ? ret || obj : obj;
}

// 测试
const person = objectFactory(Person, 'tom');
console.log(person); // {name: 'tom'}
person.go(); // 'tom'