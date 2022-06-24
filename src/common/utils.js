// 防抖函数
export function debounce(func, delay) {
  let timer = null;
  return function () {
    timer && clearTimeout(timer)
    timer = setTimeout(() => {
      // 这里的this执行return的这个函数的this，而return的函数的this谁调用this就是谁
      func.apply(this, arguments)
    }, delay);
  }
}

// 节流函数
export function throttle(func, delay) {
  let timer = null;
  return function () {
    if (timer) {
      return;
    }
    timer = setTimeout(() => {
      func.apply(this, arguments);
      timer = null;
    }, delay);
  };
}