/**
 * 浅拷贝：Array的 slice，concat，Object的 Object.create(), Object.assign() 都是浅拷贝。浅拷贝只是适用于非嵌套型的对象或者数组才有效。比如 {a: 1, b: 2}, [1, 'name'] 等。但是对于嵌套型的对象或者数组就无效了，比如 {a: 1: b: {c : 1}}，[1, {c: 2}]。这是因为浅拷贝只是复制栈上面的信息，而对象和数组是引用类型，栈上面存的是指向堆中存放数据的地址，所以浅拷贝之后，引用的依然是同一个对象或者数组。
 * 深拷贝：JSON.stringify 和 JSON.parse 配合使用，可以实现深拷贝，但是使用场景非常有限，拷贝之后，值为 函数或者 undefined 以及 null 的元素就消失了。一般来说，要实现深拷贝，就需要自己手写方法或者借助于第三方的库，比如 jQuery 中的 extend 或者 lodash 中的 cloneDeep
 * 
 */


// jQuery 版本
/**
 *  jQuery.extend( [deep ], target, object1 [, objectN ] )
 *  deep: Boolean. true-深拷贝，false-浅拷贝
 *  target: 被拷贝到的对象
 *  object1: 拷贝的对象
 *  objectN: 拷贝的对象
 */ 
$.fn.extend = function () {
  //jquery喜欢在初始定义好所有的变量
  let options,//  被拷贝的对象
    name,// 遍历时的属性
    src,// 返回对象本身的属性值
    copy,// 需要拷贝的内容
    copyIsArray,//  判断是否为数组
    clone,// 返回拷贝的内容
    target = arguments[0] || {},
    i = 1,
    length = arguments.length,
    deep = false;// 默认为浅拷贝

  //target 是传入的第一个参数,表示是否要深递归
  if (typeof target === 'boolean') {
    deep = target;
    //既然为boolean，则此处初始化target为第二个参数或者空对象
    target = arguments[i] || {};
    // 如果传了类型为 boolean 的第一个参数，i 则从 2 开始
    i++
  }

  //如果传入的第一个参数不是对象或者其他，初始化为一个空对象
  if (typeof target !== 'object' && $.isFunction(target)) {
    target = {};
  }
  //如果只传入了一个参数，表示是jquery静态方法，直接返回自身
  if (i === length) {
    target = this;
    i--;
  }
  for (; i < length; i++) {
    if ((options = arguments[i]) !== null) {
      for (name in options) {
        src = target[name];//获得源对象的值
        copy = options[name];//获得要拷贝对象的值
        //说是为了避免无限循环，例如 extend(true, target, {'target':target});
        if (target === copy) continue;
        //如果是数据正确，且是一个纯粹的对象（纯粹的对象指的是 通过 "{}" 或者 "new Object" 创建的）或者是一个数组的话
        if (deep && copy && ($.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
          //如果是一个数组的话
          if (copyIsArray) {
            copyIsArray = false;
            clone = src && Array.isArray(src) ? src : [];//判断源对象是不是数组，如果不是，直接变为空数组，拷贝属性高优先原则
          } else {
            clone = src && $.isPlainObject(src) ? src : {};//判断原对象属性是否有值，如果有的话，直接返回原值，否则新建一个空对象
          }
          //继续深拷贝下去
          target[name] = $.extend(deep, clone, copy);
        } else if (copy !== undefined) {
          //如果不为空，则不是需要深拷贝的数据和对象，而是string,data,boolean等等，可以直接赋值
          target[name] = copy;
        }
      }
    }
  }
  // 返回新的拷贝完的对象
  return target;
}

// 另一版本 https://github.com/yygmind/blog/issues/29
function deepClone(source, hash = new WeakMap()) {
  // 首先判断source是否为Object类型，同时排除null
  if (!isObject(source)) {
    return source;
  }
  if (hash.has(source)) {
    return hash.get(source);
  }
  let target = Array.isArray(source) ? [] : {};
  Object.keys(source).forEach(key => {
    if (isObject(source[key])) {
      target[key] = deepClone(source[key], hash);
    } else {
      target[key] = source[key];
    }
  });
  hash.set(source, target);
  return target;
}

// 判断是否为对象或数组，排除null
function isObject(obj) {
  return typeof obj === 'object' && obj !== null;
}

// 上面使用递归的方式，最大的缺点是容易爆栈，可以采用树的遍历 https://segmentfault.com/a/1190000016672263
function deepClone(source) {
  const root = {};

  const loopList = [
    {
      parent: root,
      key: undefined,
      data: source
    }
  ];

  while(loopList.length) {
    // 深度优先
    const node = loopList.pop();
    const parent = node.parent;
    const key = node.key;
    const data = node.data;

    // 初始化赋值目标
    let res = parent;
    if (typeof key !== 'undefined') {
      res = parent[key] = {};
    }

    Object.keys(data).forEach(k => {
      if (typeof data[k] === 'object') {
        loopList.push({
          parent: res,
          key: k,
          data: data[k]
        });
      } else {
        res[k] = data[k];
      }
    });
  }

  return root;
}
