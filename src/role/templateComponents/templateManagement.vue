<template>
  <div class="template">
    <div class="header">
      <h2>{{options.title}}</h2>
    </div>
    <xheaderBar :options="options"></xheaderBar>
    <!--新增-->
    <add-components :options="options"></add-components>
    <!--修改-->
    <edit-components :options="options"></edit-components>
    <!--列表-->
    <xtable :tableFn="tableFn" :options="options"></xtable>
    <!--分页-->
    <xpagers :options="options"></xpagers>
    <xdetails :options="options"></xdetails>
  </div>
</template>
<script>
  import o from 'o.js'
  import addComponents from './add-components.vue'
  import editComponents from './edit-components.vue'

  import * as cVuex from '../../tableComponents/xVuex.js'
  import urlAppend from 'url-append'
  import Vue from 'vue'
  export default {
    name: 'templateManagement',
    data () {
      let url = `${Vue.$baseUrl.roleUrl}/RoleTemplate`
      return {
        ok: false,
        ready: false,  // 预加载中
        states: {},  // vux存入本地watch
        filterBox: {}, // 存储筛选信息
        options: Object.assign({}, cVuex.options, {   // options将存入vuex,基础配置看 cVuex.options
          api: url,  // 原始地址，不会改动
          url: url, // 计算存入的，初始值和api相同
          title: '制定角色模板',  // 本页面名称
          gridKey: 'templateManagement',  // 本页面 Eng名，唯一
          arr: [
            {
              type: 'selection',
              width: 60,
              add_hide: 1,  // 新增页面 是否显示：不显示写，显示可不写或其他值
              edit_hide: 1, // 编辑页面 是否显示：不显示写，显示可不写或其他值
              search_hide: 1, // 搜索下拉 是否显示：不显示写，显示可不写或其他值
              align: 'center'
            },
            {
              key: 'Id',
              title: 'Id',
              search_hide: 1, // 搜索下拉 是否显示：不显示写，显示可不写或其他值
              list_hide: 1,  // list 是否显示：不显示写1，显示可不写或其他值
              add_hide: 1,  // 新增页面 是否显示：不显示写，显示可不写或其他值
              edit_hide: 12, // 编辑页面 是否显示：不显示写，显示可不写或其他值
              type: ''
            },
            {
              key: 'Name',
              title: '名称',
              search_hide: 12, // 搜索下拉 是否显示：不显示写，显示可不写或其他值
              list_hide: 12,  // list 是否显示：不显示写1，显示可不写或其他值
              add_hide: 12,  // 新增页面 是否显示：不显示写，显示可不写或其他值
              edit_hide: 12, // 编辑页面 是否显示：不显示写，显示可不写或其他值
              type: '',
              rules: [{
                required: true, validator: Vue.$validate.required, trigger: 'blur'
              }]
            },
            {
              key: 'RoleTypeId',
              title: '权限类别',
              search_hide: 1,
              edit_hide: 12,
              add_hide: 1,
              type: '',
              rules: [{required: true}]
            },
            {
              key: 'Description',
              title: `说明`,
              list_hide: 12,  // list 是否显示：不显示写1，显示可不写或其他值
              add_hide: 12,  // 新增页面 是否显示：不显示写，显示可不写或其他值
              edit_hide: 12, // 编辑页面 是否显示：不显示写，显示可不写或其他值
//              disabled: 'disabled', //  编辑页面是否可编辑：不可编辑写，可编辑不写或其他值
              type: '',
              rules: [{required: true,validator: Vue.$validate.required, trigger: 'blur'}]
            },
            {
//                            key: 'action',
              title: '操作',
              width: 120,
              add_hide: 1,  // 新增页面 是否显示：不显示写，显示可不写或其他值
              edit_hide: 1, // 编辑页面 是否显示：不显示写，显示可不写或其他值
              search_hide: 1, // 搜索下拉 是否显示：不显示写，显示可不写或其他值
              type: '',
              render: (h, params) => {
                return h('div',
                  {
                    class: 'tableBtn'
                  }, [
                    h('i-button', {
                      title: '编辑',
                      props: {
                        type: 'info',
                        size: 'small'
                      },
                      on: {
                        click: () => {
                          this.setData(params.row)
                        }
                      }
                    }, [
                      h('Icon', {
                        props: {
                          type: 'edit'
                        }
                      })
                    ]),
                    h('i-button', {
                      title: '删除',
                      props: {
                        type: 'error',
                        size: 'small'
                      },
                      on: {
                        click: () => {
                          this.delData(params.row)
                        }
                      }
                    }, [
                      h('Icon', {
                        props: {
                          type: 'trash-a'
                        }
                      })
                    ])
                  ])
              }
            }
          ]
        })
      }
    },
    mounted: function () {
      let _self = this
      o().config({
        error: function (e, response) {
          _self.$Modal.error({
            title: '错误信息',
            content: response
          })
        }      // a function which is executed on error
      })
      cVuex.registerModule(this, this.options, this.options.gridKey)
      this.$Message.config({
        top: 80,
        duration: 1.5
      })
    },
    methods: {
      tableFn () {
        return {}
      },
      setData (data) { // 设置修改弹窗数据
        if (data) {
          for (let item of this.options.arr) {
            if (item.type === 'select') {
              this.options[item.key].filter(function (e) {
                if (e.label === data[item.key]) {
                  data[item.key] = e.values
                }
              })
            }
          }
          this.$store.dispatch(this.options.gridKey + '_edit_Window_Visible', data)
        }
      },
      //        删除数据()
      delData (row, column) {
        let _self = this
        _self.$Modal.confirm({
          title: '批量删除确认',
          content: '此操作将删除该文件, 是否继续?',
          onOk: function () {
            o(_self.options.api).find(row['Id']).remove().save().then(function (data) {
              let msg = row.Name ? row.Name + '删除成功' : '删除成功'
              _self.$Message.info(msg)
              _self.$store.dispatch(_self.options.gridKey + '_set_refresh')
            })
          }
        })
      }
    },
    components: {
      'add-components': addComponents,
      'edit-components': editComponents
    }
  }
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss" scoped>
  .template {
    background: #fff;
    padding: 12px;
  }

  .pagerHead {
    padding: 12px 0px;
  }

  .header {
    padding: 12px 0px;
    h2 {
      border-left: 6px solid #39f;
      padding-left: 12px;
      font-size: 24px;
    }
  }

  .filterBox {
    margin-top: 20px;
    label {
      font-weight: 500 !important;
    }
    .filterName {
      margin-right: 12px;
      margin-bottom: 0px !important;
      vertical-align: middle;
    }
  }
</style>
