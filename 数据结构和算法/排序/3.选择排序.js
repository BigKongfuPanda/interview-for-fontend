/**
 * 选择排序是一种原址比较排序法，大致思路：

找到数组中的最小（大）值，并将其放到第一位，然后找到第二小的值放到第二位……以此类推。

JavaScript实现（从小到大排序）：
 */

 function selectionSort(arr) {
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    let min = i;
    for (let j = i; j < len; j++) {
      if (arr[j] < arr[min]) {
        min = j;
      }
    }
    if (min !== i) {
      [arr[min], arr[i]] = [arr[i], arr[min]];
    }
  }
  return arr;
 }