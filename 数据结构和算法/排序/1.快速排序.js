/**
 * 快排：快排的原理是在数组中找一个基准值 base，创建两个数组 left 和 right，遍历整个数组，当当前元素小于等于基准值base的时候，放入左边数组left中，否则放入右边数组right中，继续按照上述方法分别递归数组left和数组right，直到left和right数组的元素小于等于1个的时候，返回合并的数组 [...qSort(left), ...[base], ...qSort(right)]
 * 时间复杂度：快排的时间复杂度为O(nlogn)，最糟糕的时候是O(n^2)
 */

 function qSort(arr) {
   const left = [];
   const right = [];
   const len = arr.length;
   const _index = Math.floor(len / 2); //找到中间数的索引值，如果是浮点数，则向下取整
   const base = arr.splice(_index, 1)[0]; //找到中间数的值
   //如果数组只有一个数，就直接返回；
   if (len <= 1) {
     return arr;
   }

   for (let i = 0, len = arr.length; i < len - 1; i++) {
     const item = arr[i]
     if (item <= base) {
       left.push(item)
     } else {
       right.push(item)
     }
   }
   return [...qSort(left), base, ...qSort(right)]
 }

