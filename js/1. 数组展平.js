/**
 *  数组展平
 *  [1,[2,3,[4,[5]]], 6] ---> [1,2,3,4,5,6]
 * */
// 方式一：递归
function flattern(arr) {
  let res = []
  for(let i = 0; i < arr.length; i ++){
    let item = arr[i];
    if(Array.isArray(item)) {
      res = res.concat(flattern(item))
    } else {
      res.push(item)
    }
  }
}
// 方式二：数组扩散符
function flattern(arr) {
  while(arr.some(item => Array.isArray(item))) {
    arr = [].concat(...arr);
  }
}
// 方式三：reduce
function flattern(arr) {
  return arr.reduce((pre, item) => {
    return pre.concat(Array.isArray(item) ? flattern(item) : item);
  }, [])
}
