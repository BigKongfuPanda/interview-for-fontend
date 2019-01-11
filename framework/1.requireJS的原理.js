/**
 * requireJS 的作用是实现JavaScript模块化，以及管理依赖。由于使用在 浏览器中，所以其处理依赖加载的方式是异步加载，这一点上，与 commonJS 规范有很大的区别。
 */


 // 第一种实现方式：https://juejin.im/post/5c3592b26fb9a049aa6f4456

var modules = {},	// 存放所有文件模块的信息，每个js文件模块的信息
  loadings = [];	//	存放所有已经加载了的文件模块的id，一旦该id的所有依赖都加载完后，该id将会在数组中移除

// 上面说了，每个文件模块都要有个id，这个函数是返回当前运行的js文件的文件名
// 比如，当前加载 3.js 后运行 3.js ，那么该函数返回的就是 '3.js'
function getCurrentJs() {
  return document.currentScript.src
}
// 创建节点
function createNode() {
  var node = document.createElement('script')
  node.type = 'text/javascript'
  node.async = true;
  return node
}
// 开始运行
function init() {
  // 加载 1.js
  loadJs('1.js')
}
// 加载文件(插入dom中)，如果传了回调函数，则在onload后执行回调函数
function loadJs(url, callback) {
  var node = createNode()
  node.src = url;
  node.setAttribute('data-id', url)
  node.addEventListener('load', function (evt) {
    var e = evt.target
    setTimeout(() => {  // 这里延迟一秒，只是让在浏览器上直观的看到每1秒加载出一个文件
      callback && callback(e)
    }, 1000)
  }, false)

  document.body.appendChild(node)
}

// 此时，loadJs(1.js)后，并没有穿回调函数，所以1.js加载成功后只是自动运行1.js代码
// 而1.js代码中，是require()，则执行的是require函数, 在下面

window.require = function (deps, callback) {
  // deps 就是对应的 ['2.js']
  // callback 就是对应的 functionA
  // 在这里，是不会运行callback的，得等到依赖都加载完的
  // 所以得有个地方，把一个文件的所有信息都先存起来啊
  var id = getCurrentJs();// 当前运行的是1.js，所以id就是'1.js'
  if (!modules.id) {
    modules[id] = { // 该模块对象信息
      id: id,
      deps: deps,
      callback: callback,
      exports: null,
      status: 1,

    }
    loadings.unshift(id); // 加入这个id，之后会循环loadings数组，递归判断id所有依赖
  }

  loadDepsJs(id); // 加载这个文件的所有依赖,即去加载[2.js]
}

function loadDepsJs(id) {
  var module = modules[id]; // 获取到这个文件模块对象
  // deps是['2.js']
  module.deps.map(item => {   // item 其实是依赖的Id，即 '2.js'
    if (!modules[i]) {   // 如果这个文件没被加载过（注：加载过的肯定在modules中有）
        loadJs(item, function () {   //（1） 加载 2.js，并且传了个回调，准备要递归了
        // 2.js加载完后，执行了这个回调函数
        loadings.unshift(item); // 此时里面有两个了, 1.js 和 2.js
        // 递归。。。要去搞3.js了
        loadDepsJs(item)// item传的2.js，递归再进来时，就去modules中取2.js的deps了
        // 每次检查一下，是否都加载完了
        checkDeps(); // 循环loadings，配合递归嵌套和modules信息，判断是否都加载完了
      })
    }
  })
}

// 上面（1）那里，加载了2.js后马上会运行2.js的，而2.js里面是
define(['js'], fn)
// 所以相当于执行了 define函数

window.define = function (deps, callback) {
  var id = getCurrentJs()
  if (!modules.id) {
    modules[id] = {
      id: id,
      deps: getDepsIds(deps),
      callback: callback,
      exports: null,
      status: 1,

    }
  }
}

// 注意，define运行的结果，只是在modules中添加了该模块的信息
// 因为其实在上面的loadDepsJs中已经事先做了loadings和递归deps的操作，而且是一直不断的循环往复的进行探查，所以define里面就不需要再像require中写一次loadDeps了

// 循环loadings，查看loadings里面的id，其所依赖的所有层层嵌套的依赖模块是否都加载完了

function checkDeps() {
  for (var i = 0, id; i < loadings.length; i++) {
    id = loadings[i]
    if (!modules[id]) continue

    var obj = modules[id],
      deps = obj.deps

    // 为什么要执行checkCycle函数呢，checkDeps是循环loadings数组的模块id，而checkCycle是去判断该id模块所依赖的**层级**的模块是否加载完
    // 即checkDeps是**广度**的循环已经加载（但依赖没完全加载完的）的id
    // checkCycle是**深度**的探查所关联的依赖
    // 还是举例吧。。。假如还有个4.js，依赖5.js，那么
    // loadings中可能是 ['1.js', '4.js']
    // 所以checkDeps --> 1.js，  4.js
    // checkCycle深入内部 1.js --> 2.js --> 3.js
    // 4.js --> 5.js
    // 一旦比如说1.js的所有依赖2.js、3.js都加载完了，那么1.js 就会在loadings中移出


    var flag = myReq.checkCycle(deps)

    if (flag) {
      console.log(i, loadings[i], '全部依赖已经loaded');

      loadings.splice(i, 1);
      // 不断的循环探查啊~~~~
      myReq.checkDeps()
    }

  }
}


// 第二个版本：https://github.com/youngwind/blog/issues/98
/**
 * Created by youngwind on 2016/11/17.
 * 模仿requirejs写一个模块加载器
 */

let require, define;
(function (global) {
    // 全局导出的模块
    let globalModules = {};
    // 模块ID
    let mid = 0;

    const IS_MAIN_ENTRY = true;

    // 模块的三种状态
    const RESOLVE = 'RESOLVE';  // 加载成功
    const REJECT = 'REJECT';    // 加载失败
    const PENDING = 'PENDING';  // 等待加载

    /**
     * 定义require函数
     * @param deps {Array} 依赖模块
     * @param callback {Function} 依赖模块都加载完之后的回调
     * @param errback {Function} 依赖模块任一一个出错,就会调用这个错误回调
     */
    require = (deps, callback, errback) => {
        if (!Array.isArray(deps)) {
            throw new Error('The first Argument of require must be an Array');
        }

        if (typeof callback !== 'function') {
            throw new Error('The second Argument of require must be a function');
        }

        if (errback && typeof errback !== 'function') {
            throw new Error('The third Argument of require must be a function');
        }

        // 加载各个依赖模块
        deps.forEach((depModuleName) => {
            loadModule(depModuleName);
        });
        moduleEvent.listen(JSON.parse(JSON.stringify(deps)), callback, errback);
    };

    define = (name, deps, callback) => {
        if (typeof name === 'function' && !deps && !callback) {
            // 只传callback
            callback = name;
            name = undefined;
            deps = undefined;
        } else if (typeof name === 'string' && typeof deps === 'function') {
            // 只传名字和callback
            callback = deps;
            deps = undefined;
        } else if (Array.isArray(name) && typeof deps === 'function') {
            // 只传依赖和callback
            callback = deps;
            deps = name;
            name = undefined;
        } else {
            throw new Error('The argument for define function is wrong.');
        }

        let src = getCurrentScriptSrc();
        if (!name) {
            name = getModuleNameFromSrc(src);
        }
        let module = {
            src,
            name,
            cb: callback,
            // exports: callback(),
            id: ++mid
        };
        globalModules[name] = module;

        if (deps) {
            // TODO 此处有问题, 因为deps可能已经准备好了,这时候listen还管用吗?
            // moduleEvent.listen(deps, callback);
            deps.forEach((dep) => {
               loadModule(dep);
            });
        } else {
            module.exports = callback();
        }

    };

    // 使用观察者模式监听各个模块的加载情况
    let moduleEvent = {
        /**
         * 存储各个模块组合所对应的成功和失败回调函数
         * 比如:
         * {
         *      'a&b': {
         *              successFns: [Fns],
         *              failFns: [Fns],
         *              done: true
         *            },
         *      'a&c':{
         *               successFns: [Fns],
         *               failFns: [Fns],
         *               done: true
         *            }
         * }
         */
        events: {},

        /** state字段将存储各模块的加载情况
         比如:
         {
            a: 'RESOLVE'
            b: 'PENDING'
            c: 'REJECT'
         }
         **/
        state: {},

        /**
         * 监听依赖模块的加载情况
         * 定义模块和入口文件的时候会用到
         * @param deps {Array} 依赖模块数组, 比如 ['a', 'b']
         * @param callback {Function} 依赖模块都成功加载之后执行的回调函数
         * @param errback {Function} 任一依赖模块加载失败之后执行的错误回调函数
         */
        listen (deps, callback, errback) {
            deps.forEach((dep) => {
                if (!this.state[dep]) {
                    this.state[dep] = PENDING;
                }
            });

            let modulesName = deps.join('&');   // -> 'a&b'
            if (!this.events[modulesName]) {
                this.events[modulesName] = {};
            }
            let modulesEvent = this.events[modulesName];

            // 将成功和失败回调函数分别注册
            (modulesEvent.successFns || (modulesEvent.successFns = [])).push(callback);
            if (!modulesEvent.failFns) {
                modulesEvent.failFns = [];
            }
            if (errback) {
                modulesEvent.failFns.push(errback);
            }
            modulesEvent.done = false;
        },

        /**
         * 触发单个模块的状态改变
         * @param moduleName {String} 模块名,比如 'a'
         * @param moduleState {String} 模块状态, 比如 RESOLVE OR REJECT OR PENDING
         */
        trigger (moduleName, moduleState){
            this.state[moduleName] = moduleState;
            this.triggerModulesState();
        },

        /**
         * 触发依赖模块集合的事件
         * 每次有模块状态改变都会调用这个事件
         */
        triggerModulesState (){
            for (let key in this.events) {
                let modules = this.events[key];

                // 如果此依赖模块集合的回调函数已经执行过了,那么直接忽略
                if (modules.done) continue;

                let res = judgeModulesState(key, this.state);
                if (res === RESOLVE) {
                    // 所有module都准备好了
                    let arg = [];
                    key.split('&').forEach((k) => {
                        arg.push(globalModules[k].exports);
                    });
                    modules.successFns.forEach((successFn) => {
                        successFn.apply(this, arg);
                    });
                    // 无论结果如何,都将完成位置置为true
                    modules.done = true;
                } else if (res === REJECT) {
                    // 有module失败了
                    modules.failFns.forEach((failFn) => {
                        failFn();
                    });
                    // 无论结果如何,都将完成位置置为true
                    modules.done = true;
                } else if (res === PENDING) {
                    // do nothing
                }
            }
        }
    };

    /**
     * 判断依赖模块组合的加载情况
     * 比如 ['a', 'b']两个模块
     * 1. 当两个模块都为resolve状态,整体才是resolve状态
     * 2. 当任意一个模块为reject状态,整体是reject状态
     * 3. 当任意一个模块时pending状态,整体是pending状态
     * 这部分的逻辑跟promise一模一样
     * @param key {String} 依赖模块组合,比如'a&b'
     * @param modules {Object} 各个模块的状态对象
     * @returns {*}
     */
    function judgeModulesState(key, modules) {
        for (let moduleName of key.split('&')) {
            if (modules[moduleName] === REJECT) {
                return REJECT;
            }
            if (modules[moduleName] === PENDING) {
                return PENDING;
            }
        }
        return RESOLVE;
    }

    /**
     * 加载模块
     * @param name {String} 模块的名字(默认名字就是文件名,且模块路径与入口文件同级)
     * @param isMainEntry {Boolean} true为main入口js文件,false为普通模块
     */
    function loadModule(moduleName, isMainEntry) {
        let scriptNode = document.createElement('script');
        scriptNode.type = 'text/javascript';
        moduleName = getModuleNameFromSrc(moduleName)
        scriptNode.src = `./${moduleName}.js`;
        scriptNode.onerror = () => {
            if (!isMainEntry) {
                moduleEvent.trigger(moduleName, REJECT);
            }
        };
        scriptNode.onload = () => {
            console.log(`The script ${moduleName}.js loaded.`);
            if (!isMainEntry) {
                moduleEvent.trigger(moduleName, RESOLVE);
            }
        };
        document.body.appendChild(scriptNode);
    }


    /**
     * 从给定的文件路径中解析出文件名
     * @param name {String} 比如 './main.js'
     * @returns {String} 比如 'main'
     */
    function getModuleNameFromSrc(name) {
        if (!name) {
            console.error('The argument of getModuleNameFromSrc can not be undefined');
            return;
        }
        let fileNameReg = /[^\\\/]*[\\\/]+/g;
        return name.replace(fileNameReg, '').split('.')[0]
    }

    /**
     * 获取当前执行js所在的script标签的src属性
     * @returns {string}
     */
    function getCurrentScriptSrc() {
        return document.currentScript.getAttribute('src');
    }

    /**
     * 加载主入口main.js文件
     */
    function loadMainEntryJS() {
        let scripts = document.getElementsByTagName('script');
        let requireScript = scripts[scripts.length - 1];
        let mainScript = requireScript.getAttribute('data-main');
        if (!mainScript) return;
        loadModule(mainScript, IS_MAIN_ENTRY);
    }

    loadMainEntryJS();

    // 测试用赋值
    global.globalModules = globalModules;
    global.moduleEvent = moduleEvent;

})(this);

// 第三个版本：https://blog.csdn.net/xutongbao/article/details/78189667