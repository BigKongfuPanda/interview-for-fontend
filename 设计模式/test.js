class Inject {
  constructor() {
    this.dependencies = {};
  }

  register(key, value) {
    this.dependencies[key] = value;
  }

  resolve(deps, fn, scope) {
    const args = [];
    for (let i = 0; i < deps.length; i++) {
      const dep = deps[i];
      if (this.dependencies.hasOwnProperty(dep)) {
        args.push(this.dependencies[dep]);
      }
    }

    return function() {
      fn.apply(scope || {}, args);
    }
  }
}

// 测试
const inject = new Inject();
inject.register('$http', {
  get: function() {
    console.log('我是依赖注入的$http下的一个函数');
  }
});
inject.register('$scope', {
  test: '我是依赖注入的$scope下的一个属性'
});
const controller =  inject.resolve(['$http', '$scope'], function($http, $scope) {
  console.log($http.get());
  console.log($scope.test);
});
controller();