<template>
  <div>
    <div class="pagerHead">
      <Row>
        <Col span="7" align="right" style="float: right;">
        <slot></slot>
        <template v-if="refreshShow">
          <slot name="refreshBtn">
            <Button @click="refreshFn" title="刷新">
              <Icon type="refresh"></Icon>
            </Button>
          </slot>
        </template>
        <slot name="refreshAfter"></slot>
        <template v-if="addShow">
          <slot name="addBtn">
            <Button type="primary" @click="setAddVisible" title="新增">
              <Icon type="plus"></Icon>
            </Button>
          </slot>
        </template>
        <slot name="addAfter"></slot>
        <template v-if="delShow">
          <slot name="batchBtn">
            <Button type="error" @click="batchDel" title="批量删除">
              <Icon type="trash-a"></Icon>
            </Button>
          </slot>
        </template>
        <slot name="delAfter"></slot>
        </Col>
        <Col span="2" style="float: right;" v-show="adSearchShow">
        <Tooltip content="是否显示高级搜索" placement="top-start">
          <span style="font-size: 13px;">高级搜索：</span>
          <i-switch v-model="advancedSearch" @on-change="switchChange">
            <span slot="open">开</span>
            <span slot="close">关</span>
          </i-switch>
        </Tooltip>
        </Col>
        <Col span="10" v-show="advancedSearch"><h3 class="pagerHead3">高级搜索</h3></Col>
        <Col span="15" style="min-height: 10px;" v-show="!advancedSearch">
          <template v-if="searchShow">
          <Row>
            <Col span="10" style="margin-right: 12px;">
              <Input
                v-model="paramsValue"
                placeholder="请输入..."
              >
              <Select :disabled="options.disabledSearch"
                      v-model="paramsSelect" slot="prepend" :style="dorpStyle">
                <template v-for="(item, key, val) in paramsOption">
                  <Option :value="key">{{item}}</Option>
                </template>
              </Select>
              <Button slot="append" icon="ios-search" @click="searchFn"></Button>
              </Input>
            </Col>
            <Col span="10">
            <slot name="searchAfter"></slot>
            <template v-if="options.timeSearch && timeSearchShow">
              <Row>
                <Col span="5">
                <div style="margin-right: 4px;">
                  <Select v-model="timeSelectKey">
                    <Option v-for="item in SelectOpints" :value="item.value" :key="item">{{ item.label }}

                    </Option>
                  </Select>
                </div>
                </Col>
                <Col span="12">
                <Date-picker class="dataSelect" :value="searchTime" format="yyyy/MM/dd" type="daterange" placement="bottom-end"
                             @on-change="searchTimeChange"
                             placeholder="选择日期" style="width: 200px"></Date-picker>
                </Col>
                <Col span="3">
                <Button icon="search" @click="searchFn" style="margin-left: 4px;"></Button>
                </Col>
              </Row>
            </template>
            </Col>
          </Row>
        </template>
        </Col>
      </Row>
      <div class="advancedSearch" v-show="advancedSearch">
        <Form :model="formItem" :label-width="120">
          <template v-for="(item, key, index) in arr">
            <template v-for="(item1, key1, index1) in advancedSearchBox">
              <template v-if="item.key===key1">
                <template v-if="item.type==='date'">
                  <div class="cellCol">
                    <Form-item :label="item1">
                      <Date-picker class="dataSelect" v-model="formItem[key1]" format="yyyy/MM/dd" type="daterange" placement="bottom-end"
                                   placeholder="选择日期" style="width: 274px"></Date-picker>
                    </Form-item>
                  </div>
                </template>
                <template v-else>
                <div class="cellCol">
                  <Form-item :label="item1">
                    <Input v-model="formItem[key1]" placeholder="请输入"></Input>
                  </Form-item>
                </div>
                </template>
              </template>
            </template>
          </template>
          <div align="right" class="advancedSearchFoot">
            <Button type="primary" icon="search" @click="advancedSearchBtn">搜索</Button>
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>
<script>
  import o from 'o.js'
  import urlAppend from 'url-append'
  import clone from 'clone'
  import * as common from '../common.js'
  export default {
    data () {
      return {
        arr: [],
        advancedSearchBox: {}, // 高级搜索选项
        advancedSearch: false, // 高级搜索是否显示
        formItem: {}, // 存储高级搜索的值
        timeSearchShow: true,
        SelectOpints: [],
        timeSelectKey: '',
        searchTime: '',
        paramsOption: {},
        paramsValue: '',
        paramsSelect: 'searchAll' // 默认搜索
      }
    },
    props: {
      headerFn: Function,
      options: Object,
      searchShow: {
        type: [Boolean, String],
        default: true
      },
      refreshShow: {
        type: [Boolean, String],
        default: true
      },
      dorpStyle: {
        type: [Boolean, String],
        default: 'width:80px'
      },
      addShow: {
        type: [Boolean, String],
        default: true
      },
      adSearchShow: {
        type: [Boolean, String],
        default: true
      },
      delShow: {
        type: [Boolean, String],
        default: true
      }
    },
    mounted: function () {
      try {
        let arrFn = this.headerFn()
        common.bindFn(this, arrFn)
      } catch (e) {
      }
      this.$store.dispatch(this.getOptions.gridKey + '_set_state_data', {searchVal: ''})
      this.paramsOption = this.setOptions(this.options.arr)
      this.advancedSearchBox = this.setAdSearchOptions(this.options.arr)
      this.arr = clone(this.options.arr)
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
    watch: {
      'getOptions.adSearchBoolean': {
        handler: function (val, oldVal) {
          if (oldVal !== undefined) {
            this.advancedSearch = val
          }
        },
        deep: true
      }
    },
    methods: {
      advancedSearchBtn () {
        this.$store.dispatch(this.options.gridKey + '_set_state_data', {advancedSearchBox: this.formItem})
        this.$store.dispatch(this.getOptions.gridKey + '_set_state_data', {searchBtn: !this.getOptions.searchBtn})
      },
      switchChange (val) {
        this.$store.dispatch(this.options.gridKey + '_set_state_data', {adSearchBoolean: val})
      },
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
            let url = _self.options.api.split('?$filter')[0]
            delObjs.forEach(function (Item) {
              o(urlAppend(url, {r: Math.random()})).find(Item.Id).remove().save().then(function (data) {
                _self.$Message.info(Item.Name ? Item.Name : '' + '删除成功')
                _self.$store.dispatch(_self.options.gridKey + '_set_refresh')
              })
            })
            //            删除最后一页 bug
            let states = _self.$store.state[_self.options.gridKey]
            let pagerCurrentPage = states.pager_CurrentPage
            let pageSize = states.pager_Size
            let pagerTotal = states.pager_Total
//            console.log(pager_Total % pageSize + '---------' + $length)
            if (pagerCurrentPage > 1 && pagerTotal % pageSize === $length) {
              _self.$store.dispatch(_self.options.gridKey + '_set_state_data', {pager_CurrentPage: pagerCurrentPage - 1})
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
      searchTimeChange (val) {
        let startTime = val[0]
        let endTime = val[1]
        this.$store.dispatch(this.getOptions.gridKey + '_set_state_data', {endTime: endTime})
        this.$store.dispatch(this.getOptions.gridKey + '_set_state_data', {startTime: startTime})
      },
      endTimeFn (val) {
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
          if (item.search_hide !== 1 && item.type !== 'select' && item.type !== 'date') {
            o[item.key] = item.title
          }
        }
        return o
      },
      setAdSearchOptions (data) {
        let o = {}
        for (let item of data) {
          if (item.search_hide !== 1 && item.type !== 'select') {
            o[item.key] = item.title
          }
        }
        return o
      }
    }
  }
</script>
<style scoped>
  .advancedSearchFoot{
    padding:0px 63px 15px 63px;
    margin-bottom: 12px;
    border-bottom: 1px solid #dddee1;
  }
  .pagerHead3{
    border-left: 6px solid red;
    padding-left: 12px;
    font-size: 18px;
  }
  .pagerHead {
    padding: 12px 0px;
  }
  .advancedSearch{
    margin-top:20px;
  }
  .cellCol{
    display: inline-block;
    width:24%;
  }
</style>
