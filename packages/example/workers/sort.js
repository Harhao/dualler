/**
 * Worker 脚本示例 - 排序算法
 *
 * 在独立线程中执行 CPU 密集计算
 * 注意：不能调用 wx.* API，不能访问 DOM
 */

// 监听主线程消息
onMessage = function(e) {
  var msg = e.data;

  if (msg.type === 'sort') {
    var data = msg.data;
    var field = msg.field;

    // 记录开始时间
    var startTime = Date.now();

    // 执行排序
    var sorted = data.sort(function(a, b) {
      if (field) {
        return a[field] > b[field] ? 1 : -1;
      }
      return a > b ? 1 : -1;
    });

    var endTime = Date.now();

    // 返回结果
    postMessage({
      type: 'sortResult',
      sorted: sorted,
      duration: endTime - startTime,
      count: sorted.length
    });
  }

  if (msg.type === 'fibonacci') {
    var n = msg.n;
    var startTime = Date.now();

    function fib(n) {
      if (n <= 1) return n;
      return fib(n - 1) + fib(n - 2);
    }

    var result = fib(n);
    var endTime = Date.now();

    postMessage({
      type: 'fibonacciResult',
      n: n,
      result: result,
      duration: endTime - startTime
    });
  }

  if (msg.type === 'prime') {
    var limit = msg.limit;
    var startTime = Date.now();

    // 埃拉托斯特尼筛法
    var sieve = new Array(limit + 1).fill(true);
    sieve[0] = sieve[1] = false;

    for (var i = 2; i * i <= limit; i++) {
      if (sieve[i]) {
        for (var j = i * i; j <= limit; j += i) {
          sieve[j] = false;
        }
      }
    }

    var primes = [];
    for (var i = 2; i <= limit; i++) {
      if (sieve[i]) primes.push(i);
    }

    var endTime = Date.now();

    postMessage({
      type: 'primeResult',
      limit: limit,
      count: primes.length,
      primes: primes.slice(0, 100), // 只返回前100个
      duration: endTime - startTime
    });
  }
};
