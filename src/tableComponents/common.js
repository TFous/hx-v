export function filterData(val) {
  let items = val;
  let obj = {};
  items.forEach(function (item) {
    if (item.add_hide !== 1) {
      // 測試
      // obj[item.key] = (item.type === 'date' ? 1 : '123')
      obj[item.key] = null
      // obj[item.key] = (item.type === 'date' ? '2017-06-06' : null)
      // obj[item.key] = (item.type === 'number' ? null : '')
      if (item.add_hide === 'relyOn' || item.add_hide === 'relyOn|show') {
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

export function endTime(t) {
  let d = new Date(t).getTime()
  let times = new Date(d)
  let year = times.getFullYear()
  let month = (times.getMonth() + 1).toString().length === 2 ? (times.getMonth() + 1) : `0${(times.getMonth() + 1)}`
  let day = (times.getDate()).toString().length === 2 ? (times.getDate()) : `0${(times.getDate())}`
  return `${year}-${month}-${day}T08:00:00`
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

export function delData(_this, row, o) {
  let _self = _this
  _self.$Modal.confirm({
    title: '批量删除确认',
    content: '此操作将删除该文件, 是否继续?',
    onOk: function () {
      o(_self.options.api).find(row['Id']).remove().save().then(function (data) {
        let msg = row.Name ? row.Name + '删除成功' : '删除成功'
        _self.$Message.info(msg)
        _self.$store.dispatch(_self.options.gridKey + '_set_refresh')
        //            删除最后一页 bug
        let states = _self.$store.state[_self.options.gridKey]
        let pager_CurrentPage = states.pager_CurrentPage
        let pager_Total = states.pager_Total
        let pageSize = states.pager_Size
        // console.log(pager_CurrentPage + '---------' + pager_Total % pageSize)
        if (pager_CurrentPage > 1 && pager_Total % pageSize === 1) {
          _self.$store.dispatch(_self.options.gridKey + '_set_state_data', {pager_CurrentPage: pager_CurrentPage - 1})
        }
      })
    }
  })
}

export function changeDel(_this, row, o) {
  let _self = _this
  _self.$Modal.confirm({
    title: '批量删除确认',
    content: '此操作将删除该文件, 是否继续?',
    onOk: function () {
      try {
        delete row._index
      } catch (e) {
      }
      Object.assign(row, {IsDelete: true})
      o(_self.options.api).find(row['Id']).patch(row).save().then(function (data) {
        let msg = row.Name ? row.Name + '删除成功' : '删除成功'
        _self.$Message.info(msg)
        _self.$store.dispatch(_self.options.gridKey + '_set_refresh')
        //            删除最后一页 bug
        let states = _self.$store.state[_self.options.gridKey]
        let pager_CurrentPage = states.pager_CurrentPage
        let pager_Total = states.pager_Total
        let pageSize = states.pager_Size
        // console.log(pager_CurrentPage + '---------' + pager_Total % pageSize)
        if (pager_CurrentPage > 1 && pager_Total % pageSize === 1) {
          _self.$store.dispatch(_self.options.gridKey + '_set_state_data', {pager_CurrentPage: pager_CurrentPage - 1})
        }
      })
    }
  })
}
export function dataAndFilters($url, keyWrod, fn, fn1, fn2, $this) {
  let _this = $this
  let clone = fn
  let url = _this.$baseUrl.rbs + $url
  fn2(fn1(url, {r: Math.random()})).get().then(function (data) {
    let datas = data.data
    let arr = []
    let filters = []
    datas.forEach(function (item) {
      let o = {}
      o['label'] = item.Value
      o['values'] = item.Id
      arr.push(o)

      let filtersObj = {}
      filtersObj['label'] = item.Value
      filtersObj['value'] = `(${keyWrod} eq ${item.Id})`
      filters.push(filtersObj)
    })
    let obj = _this.$store.state[_this.options.gridKey]
    let deep = clone(obj)
    let newArr = deep.arr
    newArr.forEach(function (item) {
      if (item.key === keyWrod) {
        item.filters = filters
      }
    })
    _this.$store.dispatch(_this.options.gridKey + '_set_state_data', {arr: newArr})
    let storeObj = {}
    storeObj[keyWrod] = arr  // {BusinessType: arr}
    _this.$store.dispatch(_this.options.gridKey + '_set_state_data', storeObj)
  })
}

// 时间转换
export function Ttime(time) {
  let d = new Date(time)
  // let newTime = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + 'T' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
  return d
}


// 时间和select转换
export function tableRender($this,Vuxoptions,clone) {
  let _this = $this
  let optArr = clone(Vuxoptions.arr)
  optArr.forEach(function (arrItem) {
    if (arrItem.type === 'select') {
      // arrItem['filters'] = []
      // arrItem['filterRemote'] = (value) => {
      //   $this.$f.tableFilter($this, arrItem.key, value)
      // }
      arrItem['render'] = (h, params) => {
        return h('div',
          {
            class: 'tableBtn'
          }, [
            (function () {
              let val = params.row[arrItem.key]
              let arr = Vuxoptions[arrItem.key]
              let name
              try {
                arr.forEach(function (item) {
                  // if (item.values !== val) {
                  //   name = val + '--- 数据字典无'
                  // }
                  if (item.values === val) {
                    name = item.label
                  }
                })
              } catch (e) {
              }
              return name
            })()
          ])
      }
    } else if (arrItem.type === 'date') {
      arrItem['render'] = (h, params) => {
        return h('div',
          {
            class: 'tableBtn'
          }, [
            (function () {
              try {
                let time = params.row[arrItem.key]
                return time !== '' ? time.split('T')[0] : ''
              } catch (e) {
              }
            })()
          ])
      }
    }
  })
  _this.$store.dispatch(Vuxoptions.gridKey + '_set_state_data', {arr: optArr})  // 还原去除 columns 的 filter
}

// 页面配置
export function fnReset($this,o) {
  let _this = $this
  _this.$Message.config({
    top: 10,
    duration: 1.5
  })
  o().config({
    error: function (e, response) {
      _this.$Notice.error({
        title: '错误信息',
        desc: response
      })
    }      // a function which is executed on error
  })
}
// 页面从vuex转换数据字典
export function dicData(data, keyWrod, fn, $this) {
  let _this = $this
  let clone = fn
  let datas = data
  let arr = []
  let filters = []
  datas.forEach(function (item) {
    let o = {}
    o['label'] = item.Value
    o['values'] = item.Id
    arr.push(o)

    let filtersObj = {}
    filtersObj['label'] = item.Value
    filtersObj['value'] = `(${keyWrod} eq ${item.Id})`
    filters.push(filtersObj)
  })
  let obj = _this.$store.state[_this.options.gridKey]
  let deep = clone(obj)
  let newArr = deep.arr
  newArr.forEach(function (item) {
    if (item.key === keyWrod) {
      item.filters = filters
    }
  })
  _this.$store.dispatch(_this.options.gridKey + '_set_state_data', {arr: newArr})
  let storeObj = {}
  storeObj[keyWrod] = arr  // {BusinessType: arr}
  _this.$store.dispatch(_this.options.gridKey + '_set_state_data', storeObj)
}


// 判断object/json 是否为空
export function isEmptyObject(e) {
  var t;
  for (t in e)
    return !1;
  return !0
}

// 设置table 表头，去除filter，筛选 及勾选，action
export function setColumn(arr) {
  let arrs = arr
  let newArr = []
  arrs.forEach(function (item) {
    if (item.type !== 'selection' && item.key !== 'action') {
      if (item.filters) {
        delete item.filterRemote
        delete item.filters
        newArr.push(item)
      } else if (item.sortable) {
        delete item.sortable
        newArr.push(item)
      } else {
        newArr.push(item)
      }
    }
  })
  return newArr
}

// 设置table 表头，action
export function setColumnNoActon(arr) {
  let arrs = arr
  let newArr = []
  arrs.forEach(function (item) {
    if (item.type !== 'selection' && item.key !== 'action') {
      newArr.push(item)
    }
  })
  return newArr
}
