<template>
  <div>
    <div class="tabletemplate" v-show="ready">
      <Table
        stripe
        border
        :columns="columns"
        :data="tableData"
        @on-row-dblclick="showDetails"
        @on-selection-change="selectionFn"
        @on-sort-change="sortFn"
      ></Table>
    </div>
    <div style="padding:80px;margin:80px;position: relative;" v-show="!ready">
      <Spin fix>
        <Icon type="load-c" size=40           class="icon-load"></Icon>
        <div>Loading</div>
      </Spin>
    </div>
  </div>
</template>
<script>
  import o from 'o.js'
  import * as fn from '../common'
  import urlAppend from 'url-append'
  export default {
    name: 'xtable',
    data () {
      return {
        ready: false,
        states: {},
        tableData: [],
        columns: []
      }
    },
    props: {
      // api接口
      tableFn: Function,
      options: Object
    },
    watch: {
      'getOptions.tableData': {
        handler: function (val, oldVal) {
          if (oldVal !== undefined) {
            let newArr = []
            val.forEach(function (e) {
              let o = Object.assign({}, e)
              newArr.push(o)
            })
            let datas = this.formatDate(newArr)
            this.tableData = datas
          }
        },
        deep: true
      },
      'states.refresh': {
        handler: function (val, oldVal) {
          oldVal !== undefined ? this.refreshFn() : null
//          this.$store.dispatch(this.options.gridKey + '_set_state_data', {pager_CurrentPage: 1})
        },
        deep: true
      },
      'states.searchBtn': {
        handler: function (val, oldVal) {
          oldVal !== undefined ? this.searchUrl(this.states.searchVal) : null
          this.$store.dispatch(this.options.gridKey + '_set_state_data', {pager_CurrentPage: 1})
        },
        deep: true
      },
      'states.pager_Size': {
        handler: function (val, oldVal) {
          this.$store.dispatch(this.options.gridKey + '_set_state_data', {pager_CurrentPage: 1})
          oldVal !== undefined ? this.getList(val) : null
        },
        deep: true
      },
      'states.arr': {
        handler: function (val, oldVal) {
          this.setColumns()
        },
        deep: true
      },
      'states.url': {   //todo   搜索也会执行,待优化
        handler: function (val, oldVal) {
          if (val !== undefined && val !== null && val !== '') {
            this.getList()
          }
        },
        deep: true
      },
      'states.pager_CurrentPage': {
        handler: function (val, oldVal) {
          this.$store.dispatch(this.options.gridKey + '_set_state_data', {pager_CurrentPage: val})
          oldVal !== undefined ? this.getList() : null
        },
        deep: true
      }
    },
    computed: {
      getOptions () {
        return this.$store.state[this.options.gridKey]
      }
    },
    mounted () {
      this.setColumns()
      this.states = this.$store.state[this.options.gridKey]
      this.refreshFn()  // 初始页面获取总页数

      // 来自父组建的事件集合
      try {
        let arrFn = this.tableFn()
        fn.bindFn(this, arrFn)
      } catch (e) {
      }
    },
    updated () {
      // 设置宽度
//      let wrapWidth = $('.ivu-table-wrapper').width()
//      let tableWidth = $('.ivu-table-header table').width()
//      if (tableWidth < wrapWidth) {
//        $('.ivu-table-wrapper').width(tableWidth)
//      }
    },
    methods: {
      /**
       *   column：当前列数据
       key：排序依据的指标
       order：排序的顺序，值为 asc 或 desc
       *
       */
      sortFn (column) {
        let key = column.key
        let order = column.order
        let orderUrl = `${key}%20${order}`
        if (order === 'normal') {
          this.searchUrl(null, '')
        } else {
          this.searchUrl(null, orderUrl)
        }
      },
      /**
       *
       * @param val   搜索值
       * @param order  排序方法
       * @param _this  默认参数，不要动，不然外部传的方法有问题
       */
      searchUrl (val, order = '', _this = this) {
        let _self = _this
        if (_self.states.searchKeys[0] === 'searchAll') {
          _self.$store.dispatch(_self.states.gridKey + '_set_state_data', {searchKeys: fn.getAllKeys(_self.options.arr)})
        }
        let Keys = _self.states.searchKeys  // 搜索 键
        let opts = _self.states.arr  // 匹配类型
        let sUrl = _self.states.api  // url
        let urlObj = {}
        /**
         *  时间搜索
         *
         */
        let startTime
        let endTime
        let timeSelectKey
        if (_self.states.startTime && _self.states.endTime) {
          startTime = fn.toLocaleString(_self.states.startTime)
          endTime = fn.toLocaleString(_self.states.endTime)
          timeSelectKey = _self.states.timeSelectKey
          if (startTime && endTime) {
            let timeUrl = `${timeSelectKey} ge ${startTime}Z and ${timeSelectKey} le ${endTime}Z`
            urlObj['timeUrl'] = `(${timeUrl})`
          }
        }
        /**
         *  条件筛选
         */
        let filterUrl = ``
        for (let filters in _self.states.filterBox) {
          let filtersHtmls = ``
          _self.states.filterBox[filters].forEach(function (key) {
            filtersHtmls += `${key}or`
          })
          filterUrl += `(${filtersHtmls.slice(0, -2)})and`
        }
        if (filterUrl !== '') {
          urlObj['filterUrl'] = `(${filterUrl.slice(0, -3)})`
        }

        /**
         *  关键词搜索
         */
        if (val) {  // 如果搜索有值
          let valUrl = ``
          for (let key of Keys) {
            for (let item of opts) {
              if (key === item['key']) {
                if (item.type === 'number') {
                  if (Number(val)) {
                    valUrl += `(${key} eq ${val})or`
                  }
                }
                if (item.type === '') {
                  valUrl += `(contains(${key},'${val}'))or`
                }
              }
            }
          }
          urlObj['keyWorkUrl'] = `(${valUrl.slice(0, -2)})`
        }
        /**
         *  url 拼接
         */
        let searchUrlString = ``
        let lastUrl = ``
        for (let key in urlObj) {
          lastUrl += `${urlObj[key]}and`
        }
        if (lastUrl !== '') {
          searchUrlString = (sUrl + `?$filter=` + `${lastUrl.slice(0, -3)}`)
          // if (startTime && endTime) {
          //     searchUrlString += `&$orderby=${timeSelectKey} desc`
          // }

          if (order !== '') {
            _self.$store.dispatch(_self.states.gridKey + '_set_state_data', {url: `${encodeURI(searchUrlString)}&$orderby=${order}`})
          } else {
            _self.$store.dispatch(_self.states.gridKey + '_set_state_data', {url: encodeURI(searchUrlString)})
          }
        } else {
          if (order !== '') {
            _self.$store.dispatch(_self.states.gridKey + '_set_state_data', {url: `${sUrl}?$orderby=${order}`})
          } else {
            _self.$store.dispatch(_self.states.gridKey + '_set_state_data', {url: sUrl})
          }
        }
      },
//      重置 刷新
      reset () {
        this.$store.dispatch(this.getOptions.gridKey + '_set_state_data', {endTime: null})
        this.$store.dispatch(this.getOptions.gridKey + '_set_state_data', {startTime: null})
        this.$store.dispatch(this.getOptions.gridKey + '_set_state_data', {searchVal: null})
        this.$store.dispatch(this.getOptions.gridKey + '_set_state_data', {filterBox: null})
      },
      //        获取表格数据
      getList (size, _this = this) {
        let _self = _this
        if (!_self.states.url) {
          _self.ready = true
          return
        }
        _self.ready = false
        o(urlAppend(_self.states.url, {r: Math.random()})).get(function (data) {
          let lengths = data.length
          if (lengths === 0) {
            _self.ready = true
            _self.$store.dispatch(_self.options.gridKey + '_set_table_data', [])
            _self.$store.dispatch(_self.options.gridKey + '_set_state_data', {pager_Total: 0})
            _self.$store.dispatch(_self.options.gridKey + '_set_state_data', {pager_CurrentPage: 1})
//            _self.tableData = []
            _self.$Message.warning('无符合要求数据')
            return
          }
          _self.$store.dispatch(_self.options.gridKey + '_set_state_data', {pager_Total: lengths})
          let pageSize, pageSkip
          if (size) {
            pageSize = size
            pageSkip = 0
          } else {
            let pager_CurrentPage = _self.states.pager_CurrentPage
            pageSize = _self.states.pager_Size
            pageSkip = _self.states.pager_Size * (pager_CurrentPage - 1)
          }

          o(urlAppend(_self.states.url, {r: Math.random()})).take(pageSize).skip(pageSkip).get(function (data) {
//            let datas = _self.formatDate(data)
//            _self.tableData = datas
            _self.$store.dispatch(_self.options.gridKey + '_set_table_data', data)
            _self.ready = true
          })
        })
      },
      formatDate (data) {  // 数据处理
        let arr = this.options.arr
        let _this = this
        if (data) {
          data.forEach(function (dataItem) {
            arr.forEach(function (arrItem) {
              if (arrItem.type === 'date') {
                var d = new Date(dataItem[arrItem.key])
                let time = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + 'T' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
                dataItem[arrItem.key] = time.split('T')[0]
              } else if (arrItem.type === 'select') {
                let selectData = _this.$store.state[_this.options.gridKey][arrItem.key]
                if (selectData) {
                  selectData.forEach(function (selectItem) {
//                    console.log(selectItem, selectItem.values + '--------' + dataItem[arrItem.key] + '---------' + arrItem.key)
                    if (selectItem.values === dataItem[arrItem.key]) {
                      dataItem[arrItem.key] = selectItem['label']
                    }
                  })
                }
              }
            })
          })
        }
        return data
      },
      refreshFn () {
        this.reset()
        this.searchUrl()
        this.getList()
      },
      showDetails (val) { // 详情页
        this.$store.dispatch(this.options.gridKey + '_details_Window_Visible', val)
      },
      selectionFn (selection) {
        this.$store.dispatch(this.options.gridKey + '_set_del_data', selection)
      },
      setData (data) { // 设置修改弹窗数据
        if (data) {
          for (let item of this.getOptions.arr) {
            if (item.type === 'select') {
              this.getOptions[item.key].filter(function (e) {
                if (e.label === data[item.key]) {
                  data[item.key] = e.values
                }
              })
            }
          }
          this.$store.dispatch(this.options.gridKey + '_edit_Window_Visible', data)
        }
      },
      setColumns () {  // 设置列表属性
        this.columns = this.getOptions.arr.filter(function (item) {
          if (item.table_hide !== 1) {
            return item
          }
        })
      },
      //        删除数据()
      delData (row, column) {
        let newROw = Object.assign({}, row, {IsDelete: '1'})
        delete newROw['_index']  // 莫名多出了个——index 删了
        let _self = this
        _self.$Modal.confirm({
          title: '删除确认',
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
              if (pager_CurrentPage > 1 && pager_Total % pageSize === 1) {
                _self.$store.dispatch(_self.options.gridKey + '_set_state_data', {pager_CurrentPage: pager_CurrentPage - 1})
              }
            })
          }
        })
      }
    },
    filters: {}
  }
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
  .tablePager {
    padding: 12px 0px;
    overflow: hidden;
    width: 100%;
    .ivu-page {
      float: right;
      margin-right: 20px;
    }
  }

  .ivu-table .warning-row {
    color: red;
    display: table-cell;
  }

  .ivu-table .warning-row:before {
    /*content: "\F100";*/
    /*color: red;*/
    /*float: left;*/
    /*position: absolute;*/
    /*margin-left:5px;*/
  }

  .ivu-table .warning-row td {
    background-color: #ff6600;
    color: #fff;
  }
</style>
