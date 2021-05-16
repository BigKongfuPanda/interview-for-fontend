/**
 * 归并排序的复杂度是O(nlogn)
 * 归并排序是一种分治算法，其思想是将原始数组切分成较小的数组，直到每个小数组只有一个位置，接着将小数组归并成较大的数组，直到最后只有一个排序完毕的大数组
 */

function mergeSortRec(arr) {
  const length = arr.length;
  if (length === 1) {
    return arr;
  }
  const mid = Math.floor(length / 2);
  const left = arr.slice(0, mid);
  const right = arr.slice(mid);
  return merge(mergeSortRec(left), mergeSortRec(right));
}

function merge(left, right) {
  const result = [];
  let il = 0;
  let ir = 0;
  while (il < left.length && ir < right.length) {
    if (left[il] < right[ir]) {
      result.push(left[il]);
      il++;
    } else {
      result.push(left[ir]);
      ir++;
    }
  }
  while (il < left.length) {
    result.push(left[il]);
    il++;
  }
  while (ir < right.length) {
    result.push(right[ir]);
    ir++;
  }
  return result;
}
