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
    <!--修改密码-->
    <template>
      <div>
        <Modal
          v-model="show"
          title="修改密码"
          @on-cancel="setVisible"
          :mask-closable="false"
          width="600"
        >
          <div class="password">
            <Form ref="formCustom"
                  :model="formCustom"
                  :rules="ruleCustom"
                  :label-width="120">
              <Row>
                <Col span="20">
                <Form-item label="密码" prop="passwd">
                  <Input type="password" v-model="formCustom.passwd"></Input>
                </Form-item>
                <Form-item label="确认密码" prop="passwdCheck">
                  <Input type="password" v-model="formCustom.passwdCheck"></Input>
                </Form-item>
                </Col>
              </Row>
            </Form>
          </div>
          <div slot="footer">
            <Button @click="setVisible">取消</Button>
            <Button type="primary" @click="handleSubmit('formCustom')">提交修改</Button>
          </div>
        </Modal>
      </div>
    </template>
  </div>
</template>
<script>
  import o from 'o.js'
  import addComponents from './add-components.vue'
  import editComponents from './edit-components.vue'

  import * as cVuex from '../../tableComponents/xVuex.js'
  import * as common from '../../tableComponents/common.js'
  import Vue from 'vue'
  import urlAppend from 'url-append'
//  let roleUrl = 'http://wucc.wdqh.com:6789/api/odata'
  export default {
    name: 'userManager',
    data () {
      let url = Vue.$baseUrl.roleUrl + '/User'
      const validatePass = (rule, value, callback) => {
        if (value.length < 6) {
          callback(new Error('密码不能少于6位'))
        }
        if (value === '') {
          callback(new Error('请输入密码'))
        } else {
          if (this.formCustom.passwdCheck !== '') {
            // 对第二个密码框单独验证
            this.$refs.formCustom.validateField('passwdCheck')
          }
          callback()
        }
      }
      const validatePassCheck = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'))
        } else if (value !== this.formCustom.passwd) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
      }
      return {
        ruleCustom: {
          passwd: [
            { validator: validatePass, trigger: 'blur' }
          ],
          passwdCheck: [
            { validator: validatePassCheck, trigger: 'blur' }
          ]
        },
        formCustom: {
          passwd: '',
          UserId: '',
          OldPassword: '',
          passwdCheck: ''
        },
        show: false,
        ready: false,  // 预加载中
        options: Object.assign({}, cVuex.options, {   // options将存入vuex,基础配置看 cVuex.options
          api: url,  // 原始地址，不会改动
          url: url, // 计算存入的，初始值和api相同
          title: '用户管理',  // 本页面名称
          gridKey: 'userManager',  // 本页面 Eng名，唯一
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
              key: 'UserName',
              title: '登录名',
              search_hide: 12, // 搜索下拉 是否显示：不显示写，显示可不写或其他值
              list_hide: 12,  // list 是否显示：不显示写1，显示可不写或其他值
              add_hide: 1,  // 新增页面 是否显示：不显示写，显示可不写或其他值
              edit_hide: 1, // 编辑页面 是否显示：不显示写，显示可不写或其他值
              type: ''
//              rules: [{required: false, message: ''}, {type: 'number', message: '必须为数字值'}]
            },
            {
              key: 'FullName',
              title: '姓名',
              type: '',
              rules: [{required: true}]
            },
            {
              key: 'SalesDepartment',
              title: `部门`,
              list_hide: 12,  // list 是否显示：不显示写1，显示可不写或其他值
              add_hide: 12,  // 新增页面 是否显示：不显示写，显示可不写或其他值
              edit_hide: 12, // 编辑页面 是否显示：不显示写，显示可不写或其他值
//              disabled: 'disabled', //  编辑页面是否可编辑：不可编辑写，可编辑不写或其他值
              type: '',
              rules: [{required: true}]
            },
//            {
//              key: 'IsManager',
//              title: '管理员',
//              width: 100,
//              search_hide: 1,
//              render (row, column) {
//                return `<i-switch v-model="row.IsManager" @on-change="managerChange(row)"></i-switch>`
//              }
//            },
            {
              key: 'IsSuperAdmin',
              title: '超级管理员',
              width: 100,
              search_hide: 1,
              render: (h, params) => {
                return h('i-switch', {
                  props: {
                    value: params.row.IsSuperAdmin
                  },
                  on: {
                    input: () => {
                      this.adminChange(params.row)
                    }
                  }
                })
              }
            },
            {
              key: 'Enabled',
              title: '启用',
              width: 100,
              type: '',
              search_hide: 1,
              render: (h, params) => {
                return h('i-switch', {
                  props: {
                    value: params.row.Enabled
                  },
                  on: {
                    input: () => {
                      this.openChange(params.row)
                    }
                  }
                })
              }
            },
            {
//                            key: 'action',
              title: '操作',
              width: 160,
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
                      title: '修改密码',
                      props: {
                        type: 'success',
                        size: 'small'
                      },
                      on: {
                        click: () => {
                          this.SetPassword(params.row)
                        }
                      }
                    }, [
                      h('Icon', {
                        props: {
                          type: 'locked'
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
      tableFn: function () {
        return{
          formatDate (data) {  // 数据处理
            return data
          }
        }
      },
      //        删除数据()
      delData (row, column) {
        let newROw = Object.assign({}, row, {IsDelete: '1'})
        delete newROw['_index']  // 莫名多出了个——index 删了
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
      },
      // 修改密码
      handleSubmit (formName) {
        let _self = this
        this.$refs[formName].validate((valid) => {
          if (valid) {
            const apiUrl = Vue.$baseUrl.roleUrl + '/User/WUCC.SetPassword'
            o(apiUrl).post({
              UserId: this.formCustom.UserId,
              NewPassword: this.formCustom.passwdCheck
            }).save().then(function (result) {
              _self.setVisible() // 关闭弹窗
              _self.$Message.success('修改成功')
            })
          } else {
            console.log('error submit!!')
            return false
          }
        })
      },
      handleReset (name) {
        this.$refs[name].resetFields()
      },
      setVisible () {
        this.show = !this.show
        this.handleReset('formCustom') // 初始化表格
      },
      SetPassword (row) {
        this.setVisible()
        this.formCustom.UserId = row.Id
        this.formCustom.OldPassword = row.Id
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
        // 管理员
      managerChange (row) {
        let _self = this
        let UserViewModel = Object.assign({}, row, {IsManager: row.IsManager})
        delete UserViewModel['Roles']
        delete UserViewModel['Logins']
        delete UserViewModel['_index']
        const apiUrl = Vue.$baseUrl.roleUrl + `/User('${row.Id}')`
        o(apiUrl).patch(UserViewModel).save().then(function (data) {
          _self.$Message.success('修改成功')
          _self.$store.dispatch(_self.options.gridKey + '_set_refresh')
        })
      },
      //      启用
      openChange (row) {
        let _self = this
        let UserViewModel = Object.assign({}, row, {Enabled: !row.Enabled})
        delete UserViewModel['Roles']
        delete UserViewModel['Logins']
        delete UserViewModel['_index']
        const apiUrl = Vue.$baseUrl.roleUrl + `/User('${row.Id}')`
        o(apiUrl).patch(UserViewModel).save().then(function (data) {
          _self.$Message.success('修改成功')
          _self.$store.dispatch(_self.options.gridKey + '_set_refresh')
        })
      },
      //      超级管理员
      adminChange (row) {
        let _self = this
        let UserViewModel = Object.assign({}, row, {IsSuperAdmin: !row.IsSuperAdmin})
        delete UserViewModel['Roles']
        delete UserViewModel['Logins']
        delete UserViewModel['_index']
        const apiUrl = Vue.$baseUrl.roleUrl + `/User('${row.Id}')`
        o(apiUrl).patch(UserViewModel).save().then(function (data) {
          _self.$Message.success('修改成功')
          _self.$store.dispatch(_self.options.gridKey + '_set_refresh')
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
