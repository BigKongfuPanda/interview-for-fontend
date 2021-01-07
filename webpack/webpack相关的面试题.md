[webpack 的面试题总结](https://juejin.cn/post/6844903877771264013)
[手把手教你撸一个 Webpack Loader](https://blog.csdn.net/lszy16/article/details/79162960?utm_medium=distribute.pc_relevant.none-task-blog-baidujs_title-2&spm=1001.2101.3001.4242)

# 什么是 bundle，什么是 chunk，什么是 modules

bundle 是由 webpack 打包出来的的文件。
chunk 是指 webpack 在进行模块的依赖分析的时候，代码分割出来的代码块。
module 是开发中的单个模块

# 为什么要有 loader

webpack 只能理解 JavaScript 和 JSON 文件，这是 webpack 开箱可用的自带能力。loader 让 webpack 能够去处理其他类型的文件，并将它们转换为有效 模块，以供应用程序使用，以及被添加到依赖图中。
这也是我们实际项目中会有 .css .less .scss .txt .jpg .vue 等等，这些都是 webpack 无法直接识别打包的文件，都需要使用 loader 来直接或者间接的进行转换成可以供 webpack 识别的 javascript 文件。

# 什么是 loader，什么是 plugin

什么是 Loader ？
在撸一个 loader 前，我们需要先知道它到底是什么。本质上来说，loader 就是一个 node 模块，这很符合 webpack 中「万物皆模块」的思路。既然是 node 模块，那就一定会导出点什么。在 webpack 的定义中，loader 导出一个函数，loader 会在转换源模块（resource）的时候调用该函数。在这个函数内部，我们可以通过传入 this 上下文给 Loader API 来使用它们。回顾一下头图左边的那些模块，他们就是所谓的源模块，会被 loader 转化为右边的通用文件，因此我们也可以概括一下 loader 的功能：把源模块转换成通用模块。

前面我们说过，loader 也是一个 node 模块，它导出一个函数，该函数的参数是 require 的源模块，处理 source 后把返回值交给下一个 loader。所以它的 “模版” 应该是这样的：

```js
module.exports = function (source) {
  // 处理 source ...
  return handledSource;
};
```

或者

```js
module.exports = function (source) {
  // 处理 source ...
  this.callback(null, handledSource);
  return handledSource;
};
```

> 注意：如果是处理顺序排在最后一个的 loader，那么它的返回值将最终交给 webpack 的 require，换句话说，它一定是一段可执行的 JS 脚本 （用字符串来存储），更准确来说，是一个 node 模块的 JS 脚本，我们来看下面的例子。

```js
// 处理顺序排在最后的 loader
module.exports = function (source) {
  // 这个 loader 的功能是把源模块转化为字符串交给 require 的调用方
  return "module.exports = " + JSON.stringify(source);
};
```

整个过程相当于这个 loader 把源文件

> 这里是 source 模块

转化为:

```js
// example.js
module.exports = "这里是 source 模块";
```

然后交给 require 调用方：

```js
// applySomeModule.js
var source = require("example.js");

console.log(source); // 这里是 source 模块
```

1. loader 是用来告诉 webpack 如何转化处理某一类文件，并且引入到打包的文件中。Webpack 将一切文件视为模块，但是 webpack 原生是只能解析 js 文件，如果想将其他文件也打包的话，就会用到 loader。 所以 Loader 的作用是让 webpack 拥有了加载和解析非 JavaScript 文件的能力。
2. plugin 是用来自定义 webpack 的打包方式，Plugin 可以扩展 webpack 的功能，让 webpack 具有更多的灵活性。 在 Webpack 运行的生命周期中会广播出许多事件，Plugin 可以监听这些事件，在合适的时机通过 Webpack 提供的 API 改变输出结果。

# webpack 的构建流程是什么?从读取配置到输出文件这个过程尽量说全

1.  Webpack 的运行流程是一个串行的过程，从启动到结束会依次执行以下流程：初始化参数：从配置文件和 Shell 语句中读取与合并参数，得出最终的参数；
2.  开始编译：用上一步得到的参数初始化 Compiler 对象，加载所有配置的插件，执行对象的 run 方法开始执行编译；
3.  确定入口：根据配置中的 entry 找出所有的入口文件；
4.  编译模块：从入口文件出发，调用所有配置的 Loader 对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理；
5.  完成模块编译：在经过第 4 步使用 Loader 翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系；
6.  输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk，再把每个 Chunk 转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会；
7.  输出完成：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统。

在以上过程中，Webpack 会在特定的时间点广播出特定的事件，插件在监听到感兴趣的事件后会执行特定的逻辑，并且插件可以调用 Webpack 提供的 API 改变 Webpack 的运行结果。

# 如何利用 webpack 来优化前端性能？（提高性能和体验）

- 压缩代码。删除多余的代码、注释、简化代码的写法等等方式。可以利用 webpack 的 UglifyJsPlugin 和 ParallelUglifyPlugin 来压缩 JS 文件， 利用 cssnano（css-loader?minimize）来压缩 css
- 利用 CDN 加速。在构建过程中，将引用的静态资源路径修改为 CDN 上对应的路径。可以利用 webpack 对于 output 参数和各 loader 的 publicPath 参数来修改资源路径
- 删除死代码（Tree Shaking）。将代码中永远不会走到的片段删除掉。可以通过在启动 webpack 时追加参数--optimize-minimize 来实现
- 利用 webpack 提供的动态 import 能力，对路由组件进行动态加载，分割打包后的文件，加快首屏加载速度
- 提取公共代码。
