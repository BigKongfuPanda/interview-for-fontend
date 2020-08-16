/**
 * 给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串，判断字符串是否有效。
 * 有效字符串需满足：
 * 左括号必须用相同类型的右括号闭合。
 * 左括号必须以正确的顺序闭合。
 * 注意空字符串可被认为是有效字符串。
 *
 * 解题思路：使用栈。遇到左括号压入栈中，遇到右括号，则与栈顶的元素来对比，如果左右括号能够匹配，则将栈顶元素弹出。遍历完字符串后，如果栈为空，则是有效的，否则无效
 * @param {string} s
 * @return {boolean}
 */
var isValid = function (s) {
  const stack = [];
  const map = new Map();
  map.set("(", ")");
  map.set("[", "]");
  map.set("{", "}");

  for (let i = 0, len = s.length; i < len; i++) {
    const item = s[i];
    if (map.has(item)) {
      stack.push(item);
    } else {
      const stackLength = stack.length;
      if (stackLength === 0) {
        return false;
      }
      if (map.get(stack[stackLength - 1]) === item) {
        stack.pop();
      } else {
        return false;
      }
    }
  }
  return !stack.length > 0;
};
