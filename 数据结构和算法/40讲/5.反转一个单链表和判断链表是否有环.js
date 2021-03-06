/**
 * 定义一个函数，输入一个链表的头节点，反转该链表并输出反转后链表的头节点。
 * 输入: 1->2->3->4->5->NULL
 * 输出: 5->4->3->2->1->NULL
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function (head) {
  let cur = null;
  let pre = head;
  while (pre !== null) {
    const t = pre.next;
    pre.next = cur;
    cur = pre;
    pre = t;
  }
  return cur;
};

/**
 * 给定一个链表，两两交换其中相邻的节点，并返回交换后的链表
 * 你不能只是单纯的改变节点内部的值，而是需要实际的进行节点交换。
 * 示例：给定 1->2->3->4, 你应该返回 2->1->4->3.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */

// 递归解法
var swapPairs = function (head) {
  if (head === null || head.next === null) {
    return head;
  }
  const next = head.next;
  head.next = swapPairs(next.next);
  next.next = head;
  return next;
};

// 非递归解法
var swapPairs = function (head) {
  let shaob = new ListNode(0); // 添加哨兵 加0
  shaob.next = head;
  let shao = shaob;
  while (shao.next != null && shao.next.next != null) {
    let start = shao.next; // 代表第一次的1
    let end = shao.next.next; // 代表第一次的2
    shao.next = end; // 0 指向 2
    start.next = end.next; // 1 指向 3
    end.next = start; // 2 指向 1
    shao = start; // 将此时的1 也就是交换后的1当哨兵 继续循环
  }
  return shaob.next; // 返回的是最初哨兵的前一个 就是链表头
};
