<template>
  <div>
    <div class="pagerHead">
      <Row>
        <Col span="19" style="min-height: 10px;">
        <template v-if="searchShow">
          <Row>
            <Col span="10">
            <Input
              v-model="paramsValue"
              placeholder="请输入..."
            >
            <Select :disabled="options.disabledSearch"
                    v-model="paramsSelect" slot="prepend" style="width: 80px">
              <template v-for="(item, key, val) in paramsOption">
                <Option :value="key">{{item}}</Option>
              </template>
            </Select>
            <Button slot="append" icon="ios-search" @click="searchFn"></Button>
            </Input>
            </Col>
            <Col span="13" style="float: right;">
            <template v-if="options.timeSearch && timeSearchShow">
              <Col span="4">
              <div style="margin-right: 4px;">
                <Select v-model="timeSelectKey">
                  <Option v-for="item in SelectOpints" :value="item.value" :key="item">{{ item.label }}

                  </Option>
                </Select>
              </div>
              </Col>
              <Col span="8">
              <Date-picker type="date" :editable="false" :options="startTime" @on-change="startTimeFn"
                           placeholder="选择开始时间"></Date-picker>
              </Col>
              <Col span="1">
              <div style="line-height: 32px;text-align: center">-</div>
              </Col>
              <Col span="8">
              <Date-picker type="date" :editable="false" :options="endTime" @on-change="endTimeFn"
                           placeholder="选择结束时间"></Date-picker>
              </Col>
              <Col span="2">
              <Button icon="search" @click="searchFn" style="margin-left: 4px;"></Button>
              </Col>
            </template>
            </Col>
          </Row>
        </template>
        </Col>
        <Col span="5" align="right">
        <slot></slot>
        <template v-if="refreshShow">
          <Button @click="refreshFn" title="刷新">
            <Icon type="refresh"></Icon>
          </Button>
        </template>
        <template v-if="addShow">
          <Button type="primary" @click="setAddVisible" title="新增">
            <Icon type="plus"></Icon>
          </Button>
        </template>
        <template v-if="delShow">
          <Button type="error" @click="batchDel" title="批量删除">
            <Icon type="trash-a"></Icon>
          </Button>
        </template>
        </Col>
      </Row>
    </div>
  </div>
</template>
<script>
  import o from 'o.js'
  import urlAppend from 'url-append'
  export default {
    data () {
      return {
        timeSearchShow: true,
        SelectOpints: [],
        timeSelectKey: '',
        startTime: {},
        endTime: {},
        paramsOption: {},
        paramsValue: '',
        paramsSelect: 'searchAll' // 默认搜索
      }
    },
    props: {
      options: Object,
      searchShow: {
        type: [Boolean, String],
        default: true
      },
      refreshShow: {
        type: [Boolean, String],
        default: true
      },
      addShow: {
        type: [Boolean, String],
        default: true
      },
      delShow: {
        type: [Boolean, String],
        default: true
      }
    },
    mounted: function () {
      this.$store.dispatch(this.getOptions.gridKey + '_set_state_data', {searchVal: ''})
      this.paramsOption = this.setOptions(this.options.arr)
      this.SelectOpints = this.setSelectOpints(this.options.arr)
      /**
       *   时间搜索是否显示：如果没有date属性则自动隐藏
       */
      if (this.SelectOpints.length === 0) {
        this.timeSearchShow = false
      }
      try {
        this.timeSelectKey = this.SelectOpints[0].value
      } catch (e) {

      }
      /**
       *  设置默认搜索
       */
      if (this.options.defaultSearch) {
        this.paramsSelect = this.options.defaultSearch
      }
    },
    computed: {
      getOptions () {
        return this.$store.state[this.options.gridKey]
      }
    },
    watch: {},
    methods: {
      refreshFn () {
        this.$store.dispatch(this.options.gridKey + '_set_refresh')
      },
      setAddVisible () {
        this.$store.dispatch(this.options.gridKey + '_add_Window_Visible')
      },
      batchDel () { // 批量删除
        let _self = this
        let delObjs = _self.getOptions.delData
        let $length = delObjs.length
        if ($length === 0) {
          this.$Message.warning('必须要选中产品项目')
          return
        }
        _self.$Modal.confirm({
          title: '批量删除确认',
          content: '此操作将永久删除该文件, 是否继续?',
          onOk: function () {
            delObjs.forEach(function (Item) {
              o(urlAppend(_self.getOptions.url, {r: Math.random()})).find(Item.Id).remove().save().then(function (data) {
                _self.$Message.info(Item.Name ? Item.Name : '' + '删除成功')
                _self.$store.dispatch(_self.options.gridKey + '_set_refresh')
              })
            })
            //            删除最后一页 bug
            let states = _self.$store.state[_self.options.gridKey]
            let pager_CurrentPage = states.pager_CurrentPage
            let pageSize = states.pager_Size
            let pager_Total = states.pager_Total
//            console.log(pager_Total % pageSize + '---------' + $length)
            if (pager_CurrentPage > 1 && pager_Total % pageSize === $length) {
              _self.$store.dispatch(_self.options.gridKey + '_set_state_data', {pager_CurrentPage: pager_CurrentPage - 1})
            }
          }
        })
      },
      setSelectOpints (data) {
        let arr = data
        let newArr = []
        arr.filter(function (e) {
          let o = {}
          if (e.type === 'date') {
            o['value'] = e.key
            o['label'] = e.title
            newArr.push(o)
          }
        })
        return newArr
      },
      startTimeFn (val) {
        this.$store.dispatch(this.getOptions.gridKey + '_set_state_data', {startTime: val})
      },
      endTimeFn (val) {
        this.$store.dispatch(this.getOptions.gridKey + '_set_state_data', {endTime: val})
      },
      searchFn () {
        this.$store.dispatch(this.getOptions.gridKey + '_set_state_data', {timeSelectKey: this.timeSelectKey})
        this.$store.dispatch(this.getOptions.gridKey + '_set_state_data', {searchBtn: !this.getOptions.searchBtn})
        this.$store.dispatch(this.getOptions.gridKey + '_set_state_data', {searchVal: this.paramsValue})
        this.$store.dispatch(this.getOptions.gridKey + '_set_state_data', {searchKeys: [this.paramsSelect]})
      },
      setOptions (data) {
        let o = {}
        o['searchAll'] = '全部'
        for (let item of data) {
          if (item.search_hide !== 1) {
            o[item.key] = item.title
          }
        }
        return o
      }
    }
  }
</script>
<style scoped>
  .pagerHead {
    padding: 12px 0px;
  }
</style>
