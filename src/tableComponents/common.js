export function filterData(val) {
  let items = val;
  let obj = {};
  items.forEach(function (item) {
    if (item.addLayer !== 'hide') {
      // 測試
      // obj[item.key] = (item.type === 'date' ? 1 : '123')
      obj[item.key] = null
      // obj[item.key] = (item.type === 'date' ? '2017-06-06' : null)
      // obj[item.key] = (item.type === 'number' ? null : '')
      if (item.addLayer === 'relyOn' || item.addLayer === 'relyOn|show') {
        obj[item.key] = item.value
      }
    }
  })
  return obj
}

export function bind(fn, ctx) {
  function boundFn(a) {
    var l = arguments.length;
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }

  // 记录原始的 fn 长度
  boundFn._length = fn.length;
  return boundFn
}

/**
 * 父组建事件传递到子组建，名称相同则覆盖，没有则新增
 *
 * @param _this   vue
 * @param fn   包含事件集合的 boj
 */
export function bindFn(_this, fn) {
  let vue = _this
  let arrFn = fn
  for (let key in arrFn) {
    vue[key] = bind(arrFn[key], vue)
  }
}

export function trim(text) {
  if (typeof text === 'string') {
    return text.replace(/(^\s*)|(\s*$)/g, '');
  } else {
    return text
  }
}

export function setStarTime(dateTime) {
  let times = new Date(dateTime)
  let year = times.getFullYear()
  let month = (times.getMonth() + 1).toString().length === 2 ? (times.getMonth() + 1) : `0${(times.getMonth() + 1)}`
  let day = (times.getDate()).toString().length === 2 ? (times.getDate()) : `0${(times.getDate())}`
  // let hours = (times.getHours()).toString().length === 2 ? (times.getHours()) : `0${(times.getHours())}`
  // let minutes = (times.getMinutes()).toString().length === 2 ? (times.getMinutes()) : `0${(times.getMinutes())}`
  // let seconds = (times.getSeconds()).toString().length === 2 ? (times.getSeconds()) : `0${(times.getSeconds())}`
  // return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`
  return `${year}-${month}-${day}T00:00:00Z`
}
export function endTime(dateTime) {
  let times = new Date(dateTime)
  let year = times.getFullYear()
  let month = (times.getMonth() + 1).toString().length === 2 ? (times.getMonth() + 1) : `0${(times.getMonth() + 1)}`
  let day = (times.getDate()).toString().length === 2 ? (times.getDate()) : `0${(times.getDate())}`
  return `${year}-${month}-${day}T15:59:59Z`
}

export function timeType(t) {
  let d = new Date(t).getTime()
  let times = new Date(d)
  let year = times.getFullYear()
  let month = (times.getMonth() + 1).toString().length === 2 ? (times.getMonth() + 1) : `0${(times.getMonth() + 1)}`
  let day = (times.getDate()).toString().length === 2 ? (times.getDate()) : `0${(times.getDate())}`
  return `${year}-${month}-${day}`
}

// 页面配置
export function fnReset($this, o) {
  let _this = $this
  _this.$Message.config({
    top: 10,
    duration: 1.5
  })
  o().config({
    error: function (e, response) {
      _this.$Notice.error({
        duration: 20,
        title: '错误信息',
        desc: response
      })
    }      // a function which is executed on error
  })
}

// 判断object/json 是否为空
export function isEmptyObject(e) {
  var t;
  for (t in e)
    return !1;
  return !0
}

// 数组去重
export function uniqueArr(arr) {
  if (arr.length === 0) {
    return arr
  }
  arr.sort();
  var newArr = [arr[0]];
  for (var i = 1, len = arr.length; i < len; i++) {
    if (arr[i] !== newArr[newArr.length - 1]) {
      newArr.push(arr[i]);
    }
  }
  return newArr;
}

// fetch 求情头 目前没用到。用的是页面的
export function fetchRequest(url, obj = {}) {
  const accessToken = JSON.parse(localStorage.getItem('STORAGE_IDENTITY')).access_token
  const headers = new Headers({
    'Content-Type': 'application/json; odata.metadata=minimal',
    'Authorization': `Bearer ${accessToken}`
  })
  let initObj = Object.assign({
    method: 'GET',
    headers: headers,
    mode: 'cors',
    cache: 'default'
  }, obj)
  return new Request(url, initObj)
}
