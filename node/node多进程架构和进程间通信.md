[node 进程间通信](https://zhuanlan.zhihu.com/p/143775249)
[Node.js 中的多进程与多线程](https://www.jianshu.com/p/a01b917403c6)
[cluster 是怎样开启多进程的，并且一个端口可以被多个 进程监听吗？](https://blog.csdn.net/qq_34629352/article/details/104956825)
[深入理解 Node.js 中的进程与线程](https://juejin.cn/post/6844903908385488903)

# 多进程单线程架构

node 本身提供了 cluster 和 child_process 模块创建子进程，本质上 cluster.fork()是 child_process.fork()的上层实现，cluster 带来的好处是可以监听共享端口，否则建议使用 child_process。

node 的多进程是主从模式，由 master 主进程做调度管理的工作，具体的请求由各个 work 工作进程来实现

node 的每个进程只能运行一个线程，进程数最大数量由 cpu 的核数来决定的

# 进程间通信

进程间通信(IPC)大概有这几种：

- 匿名管道
- 命名管道
- 信号量
- 消息队列
- 信号
- 共享内存
- 套接字

从技术上划分又可以划分成以下四种：

- 消息传递(管道，FIFO，消息队列)
- 同步(互斥量，条件变量，读写锁等)
- 共享内存(匿名的，命名的)
- 远程过程调用

node IPC 通过管道技术 加 事件循环方式进行通信，管道技术在 windows 下由命名管道实现，在\*nix 系统则由 Unix Domain socket 实现，提供给我们的是简单的 message 事件和 send 方法。

那管道是什么呢？

管道实际上是在内核中开辟一块缓冲区，它有一个读端一个写端，并传给用户程序两个文件描述符，一个指向读端，一个指向写端口，然后该缓存区存储不同进程间写入的内容，并供不同进程读取内容，进而达到通信的目的。

管道又分为匿名管道和命名管道，匿名管道常见于一个进程 fork 出子进程，只能亲缘进程通信，而命名管道可以让非亲缘进程进行通信。

其实本质上来说进程间通信是利用内核管理一块内存，不同进程可以读写这块内容，进而可以互相通信

Node 中，IPC 通道被抽象为 Stream 对象。在调用 send() 发送消息时，会先将消息序列化，然后发送到 IPC 中。接收到的消息时，先反序列化为对象，然后通过 message 事件触发给应用层。

进程在实际创建子进程之前，会创建 IPC 通道并监听它，然后才真正的创建出子进程，这个过程中也会通过环境变量（NODE_CHANNEL_FD）告诉子进程这个 IPC 通道的文件描述符。子进程在启动的过程中，根据文件描述符去连接这个已存在的 IPC 通道，从而完成父子进程之间的连接。

# 端口共同监听原理

node 中多个子进程可以同时监听同一个端口

如果多个 Node 进程监听同一个端口时会出现 Error:listen EADDRIUNS 的错误，而 cluster 模块为什么可以让多个子进程监听同一个端口呢?原因是 master 进程内部启动了一个 TCP 服务器，而真正监听端口的只有这个服务器，当来自前端的请求触发服务器的 connection 事件后，master 会将对应的 socket 具柄发送给子进程。

我们之前已经实现了句柄可以发送普通对象及 socket 对象外，我们还可以通过句柄的方式发送一个 server 对象。我们在 master 进程中创建一个 TCP 服务器，将服务器对象直接发送给 worker 进程，让 worker 进程去监听端口并处理请求。因此 master 进程和 worker 进程就会监听了相同的端口了。当我们的客户端发送请求时候，我们的 master 进程和 worker 进程都可以监听到，我们知道我们的 master 进程它是不会处理具体的业务的。
因此需要使用 worker 进程去处理具体的事情了。因此请求都会被 worker 进程处理了。

那么在这种模式下，主进程和 worker 进程都可以监听到相同的端口，当网络请求到来的时候，会进行抢占式调度，只有一个 worker 进程会抢到链接然后进行服务，由于是抢占式调度，可以理解为谁先来谁先处理的模式，因此就不能保证每个 worker 进程都能负载均衡的问题。下面是一个 demo 如下：

master.js 的代码如下：

```js
const childProcess = require("child_process");
const net = require("net");

// 获取cpu的数量
const cpuNum = require("os").cpus().length;

let workers = [];
let cur = 0;

for (let i = 0; i < cpuNum; ++i) {
  workers.push(childProcess.fork("./worker.js"));
  console.log("worker process-" + workers[i].pid);
}

// 创建TCP服务器
const tcpServer = net.createServer();

tcpServer.listen(8989, () => {
  console.log("Tcp Server: 127.0.0.8989");
  // 监听端口后将服务器句柄发送给worker进程
  for (let i = 0; i < cpuNum; ++i) {
    workers[i].send("tcpServer", tcpServer);
  }
  // 关闭master线程的端口监听
  tcpServer.close();
});
```

worker.js 代码如下：

```js
// 接收主进程发来的消息
process.on("message", (msg, tcpServer) => {
  if (msg === "tcpServer" && tcpServer) {
    tcpServer.on("connection", (socket) => {
      setTimeout(() => {
        socket.end("Request handled by worker-" + process.pid);
      }, 100);
    });
  }
});
```

tcp_client.js 代码如下：

```js
const net = require("net");
const maxConnectCount = 10;

for (let i = 0; i < maxConnectCount; ++i) {
  net
    .createConnection({
      port: 8989,
      host: "127.0.0.1",
    })
    .on("data", (d) => {
      console.log(d.toString());
    });
}
```

# 进程守护

每次启动 Node.js 程序都需要在命令窗口输入命令 node app.js 才能启动，但如果把命令窗口关闭则 Node.js 程序服务就会立刻断掉。除此之外，当我们这个 Node.js 服务意外崩溃了就不能自动重启进程了。这些现象都不是我们想要看到的，所以需要通过某些方式来守护这个开启的进程，执行 node app.js 开启一个服务进程之后，我还可以在这个终端上做些别的事情，且不会相互影响。，当出现问题可以自动重启。

本质上 是通过在 master 主进程中，监听 `exit` 事件，当监听到子进程意外退出的时候，重新 fork 一个子进程出来

# node.js 线程

## node.js 单线程的误区

Node 中最核心的是 v8 引擎，在 Node 启动后，会创建 v8 的实例，这个实例是多线程的。

- 主线程：编译、执行代码。
- 编译/优化线程：在主线程执行的时候，可以优化代码。
- 分析器线程：记录分析代码运行时间，为 Crankshaft 优化代码执行提供依据。
- 垃圾回收的几个线程。

所以大家常说的 Node 是单线程的指的是 JavaScript 的执行是单线程的(开发者编写的代码运行在单线程环境中)，但 Javascript 的宿主环境，无论是 Node 还是浏览器都是多线程的因为 libuv 中有线程池的概念存在的，libuv 会通过类似线程池的实现来模拟不同操作系统的异步调用，这对开发者来说是不可见的。
