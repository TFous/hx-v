// deepCopy
export function deepCopy(data) {
  const t = typeOf(data);
  let obj;
  if (t === 'array') {
    obj = [];
  } else if (t === 'object') {
    obj = {};
  } else {
    return data;
  }

  if (t === 'array') {
    for (let i = 0; i < data.length; i++) {
      obj.push(deepCopy(data[i]));
    }
  } else if (t === 'object') {
    for (let i in data) {
      obj[i] = deepCopy(data[i]);
    }
  }
  return obj;
}

export function filterData(val) {
  let items = val;
  let obj = {};
  for (var item of items) {
    if (item.add_hide !== 1) {
      obj[item.key] = (item.type === 'number' ? null : '')
    }
  }
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
export function tableFn(_this, fn) {
  let vue = _this
  let arrFn = fn
  for (let key in arrFn) {
    vue[key] = bind(arrFn[key], vue)
  }
}
/**
 *  处理搜索下拉菜单，返回所有key
 * @param data
 * @returns {Array}
 */
export function getAllKeys(data) {
  let keys = []
  for (let item of data) {
    if (item.search_hide !== 1) {
      keys.push(item.key)
    }
  }
  return keys
}

/**
 *  设置table td 颜色
 * @param attrs   需要加class 的td key
 * @param val   className
 * @returns {{}}
 */
export function setCellClassName(attrs, val) {
  let obj = attrs
  let o = {}
  for (let item of obj) {
    if (item.list_hide !== 1) {
      o[item.key] = val
    }
  }
  return o
}

export function toLocaleString(t) {
  let d = new Date(t).getTime() - 57600000  // 16小时
  let times = new Date(d)
  let year = times.getFullYear()
  let month = (times.getMonth() + 1).toString().length === 2 ? (times.getMonth() + 1) : `0${(times.getMonth() + 1)}`
  let day = (times.getDate()).toString().length === 2 ? (times.getDate()) : `0${(times.getDate())}`
  let hours = (times.getHours()).toString().length === 2 ? (times.getHours()) : `0${(times.getHours())}`
  let minutes = (times.getMinutes()).toString().length === 2 ? (times.getMinutes()) : `0${(times.getMinutes())}`
  let seconds = (times.getSeconds()).toString().length === 2 ? (times.getSeconds()) : `0${(times.getSeconds())}`
  return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds
}

/**
 *
 * @param $this
 * @param filterKey
 * @param filterVal
 */
export function tableFilter($this, filterKey, filterVal) {
  let _this = $this
  let obj = {}
  if (filterVal.length !== 0) {
    obj[filterKey] = filterVal
    _this.$store.dispatch(_this.options.gridKey + '_set_filterbox', obj)
  } else {  // 不删除 全部 会出错
    obj[filterKey] = []
    _this.$store.dispatch(_this.options.gridKey + '_set_filterbox', obj)
  }
  let searchBtn = _this.$store.state[_this.options.gridKey].searchBtn
  _this.$store.dispatch(_this.options.gridKey + '_set_state_data', {searchBtn: !searchBtn})
}
