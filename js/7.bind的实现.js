// https://github.com/mqyqingfeng/Blog/issues/12
Function.prototype._bind = function(context) {
  console.log(this); // log
  const name = this.name;
  const _args = this.arguments;
  context[name] = this;
  context[name][arguments] = _args;
  return context[name];
}

var name = 'window';

function log(num) {
  console.log(this.name);
  console.log(num);
}

const obj = {
  name: 'obj'
};

log.bind(obj, 1)();
// log._bind();



