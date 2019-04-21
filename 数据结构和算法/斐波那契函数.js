// 递归方式

function fib(n) {
  if (n <= 2) {
    return 1;
  }
  return fib(n-2) + fib(n-1);
}

// 非递归
function fib(n) {
  let n1 = 1;
  let n2 = 1;
  let n = 1;
  for (let i = 3; i < n; i++) {
    n = n1 + n2;
    n1 = n2;
    n2 = n;
  }
  return n;
}

// 队列
function fib(n) {
  let list = [1, 1];
  if (n <= 2) {
    return 1;
  }
  for(let i = 1; i <= n - 2; i++) {
    let head = list.shift();
    let next = head + list[0];
    list.push(next);
  }
  return list.pop();
}