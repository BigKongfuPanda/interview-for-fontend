/**
 *  单例模式的定义是：保证一个类仅有一个一个实例，并提供一个访问它的全局访问点。
 *  单例模式能在合适的时候创建对象，并且创建唯一的一个。
代码接近于生活，很有意思。比如一个网站的登录，点击登录后弹出一个登录弹框，即使再次点击，也不会再出现一个相同的弹框。又或者一个音乐播放程序，如果用户打开了一个音乐，又想打开一个音乐，那么之前的播放界面就会自动关闭，切换到当前的播放界面。这些都是单例模式的应用场景。
要实现一个单例模式，一个经典的方式是创建一个类，类中又一个方法能创建该类的实例对象，还有一个标记，记录是否已经创了过了实例对象。如果对象已经存在，就返回第一次实例化对象的引用。
 * */

 class Singleton {
   constructor(name) {
     this.name = name;
     this.instance = null;
   }
   static getInstance(name) {
     if (!this.instance) {
       this.instance = new Singleton(name);
     }
     return this.instance;
   }
 }

 // 惰性单例: 惰性单例指的是在需要的时候才创建对象的实例。惰性单例是单例模式的重点

 let createLoginLayer = (function() {
  let div;
  return function() {
    if (!div) {
      div = document.createElement('div');
    }
    return div;
  }
 })();

 document.getElementById('loginBtn').onclick = function() {
  let loginLayer = createLoginLayer();
  loginLayer.style.display = 'block';
 };
