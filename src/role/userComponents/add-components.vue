<template>
    <div>
        <Modal
                v-model="show"
                title="新增 - 用户管理"
                @on-cancel="setVisible"
                :mask-closable="false"
                width="980"
        >
            <div class="edit">
                <Row>
                    <Col span="24">
                    <div class="box-body">
                        <div class="row item_input_row">
                            <Form ref="formCustom"
                                  :model="formCustom"
                                  :rules="ruleCustom"
                                  :label-width="120">
                                <Row>
                                    <Col span="12">
                                    <Form-item label="登录名" prop="UserName">
                                        <Input v-model="formCustom.UserName" placeholder="请输入登录名"></Input>
                                    </Form-item>
                                    </Col>
                                    <Col span="12">
                                    <Form-item label="姓名" prop="FullName">
                                        <Input v-model="formCustom.FullName" placeholder="请输入姓名"></Input>
                                    </Form-item>
                                    </Col>
                                    <Col span="12">
                                    <Form-item label="密码" prop="Password">
                                        <Input type="password" v-model="formCustom.Password" placeholder="请输入密码"></Input>
                                    </Form-item>
                                    </Col>
                                    <Col span="12">
                                    <Form-item label="确认密码" prop="PasswordConfrim">
                                        <Input type="password" v-model="formCustom.PasswordConfrim" placeholder="请再次输入密码"></Input>
                                    </Form-item>
                                    </Col>
                                    <Col span="12">
                                    <Form-item label="部门" prop="SalesDepartment">
                                        <Input v-model="formCustom.SalesDepartment" placeholder="请输入部门"></Input>
                                    </Form-item>
                                    </Col>
                                    <Col span="12">
                                    <Form-item label="超级管理员" prop="IsSuperAdmin">
                                        <Tooltip content="超级管理员拥有全部权限，可以进行任何操作">
                                            <i-switch v-model="formCustom.IsSuperAdmin"></i-switch>
                                        </Tooltip>
                                    </Form-item>
                                    </Col>
                                    <!--<Col span="12">-->
                                    <!--<Form-item label="管理员" prop="IsManager">-->
                                        <!--<Tooltip content="管理员可以管理自己创建的用户,并将自己的权限赋予该账户">-->
                                            <!--<i-switch v-model="formCustom.IsManager"></i-switch>-->
                                        <!--</Tooltip>-->
                                    <!--</Form-item>-->
                                    <!--</Col>-->
                                    <Col span="12">
                                    <Form-item label="启用" prop="Enabled">
                                        <Tooltip content="禁用的账号无法登录">
                                            <i-switch v-model="formCustom.Enabled"></i-switch>
                                        </Tooltip>
                                    </Form-item>
                                    </Col>
                                    <template v-if="senior">
                                        <Col span="24">
                                        <div class="addLine"></div>
                                        </Col>
                                    </template>
                                    <Col span="24">
                                    <Form-item label="显示高级选项" prop="senior">
                                        <Tooltip content="禁用的账号无法登录">
                                            <i-switch v-model="senior"></i-switch>
                                        </Tooltip>
                                    </Form-item>
                                    </Col>
                                    <template v-if="senior">
                                        <Col span="12">
                                        <Form-item label="锁定结束时间Utc" prop="LockoutEndDateUtc">
                                            <Date-picker :editable="false" v-model="formCustom.LockoutEndDateUtc" type="date" placeholder="选择日期" style="width: 200px"></Date-picker>
                                        </Form-item>
                                        </Col>
                                        <Col span="12">
                                        <Form-item label="锁定结束本地时间" prop="LockoutEnabled">
                                            <i-switch v-model="formCustom.LockoutEnabled"></i-switch>
                                        </Form-item>
                                        </Col>
                                        <Col span="12">
                                        <Form-item label="电子邮件" prop="Email">
                                            <Input v-model="formCustom.Email" placeholder="请输入电子邮件"></Input>
                                        </Form-item>
                                        </Col>
                                        <Col span="12">
                                        <Form-item label="邮件是否认证" prop="EmailConfirmed">
                                            <i-switch v-model="formCustom.EmailConfirmed"></i-switch>
                                        </Form-item>
                                        </Col>
                                        <Col span="12">
                                        <Form-item label="电话号码" prop="PhoneNumber">
                                            <Input v-model="formCustom.PhoneNumber" placeholder="请输入电话号码"></Input>
                                        </Form-item>
                                        </Col>
                                        <Col span="12">
                                        <Form-item label="电话号码是否认证" prop="PhoneNumberConfirmed">
                                            <i-switch v-model="formCustom.PhoneNumberConfirmed"></i-switch>
                                        </Form-item>
                                        </Col>
                                        <Col span="12">
                                        <Form-item label="登录失败次数" prop="AccessFailedCount">
                                            <Input-number :min="1" v-model="formCustom.AccessFailedCount"></Input-number>
                                        </Form-item>
                                        </Col>
                                    </template>
                                </Row>
                            </Form>
                        </div>
                    </div>
                    </Col>
                </Row>
            </div>
            <div slot="footer" align="right">
                <Button @click="setVisible">取消</Button>
                <Button type="primary" @click="handleSubmit('formCustom')">提交</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
  import * as cVuex from '../../tableComponents/xVuex.js'
//  let roleUrl = 'http://wucc.wdqh.com:6789/api/odata'
  import * as common from '../../tableComponents/common.js'
  import o from 'o.js'
  import Vue from 'vue'
  export default {
    data () {
      const validatePass = (rule, value, callback) => {
        if (value.length < 6) {
          callback(new Error('密码不能少于6位'))
        }
        if (value === '') {
          callback(new Error('请输入密码'))
        } else {
          if (this.PasswordConfrim !== '') {
            // 对第二个密码框单独验证
            this.$refs.formCustom.validateField('PasswordConfrim')
          }
          callback()
        }
      }
      const validatePassCheck = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'))
        } else if (value !== this.formCustom.Password) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
      }
      return {
        formCustom: {
          UserName: '',
          Id: null,
          FullName: '',
          Password: '',
          PasswordConfrim: '',   //  验证 ，新增提交必须删除
          SalesDepartment: '',
          IsSuperAdmin: false,
          IsManager: false,
          Enabled: true,
          Email: null,
          Oper: null,
          EmailConfirmed: false,
          TwoFactorEnabled: false,
          PhoneNumber: null,
          PhoneNumberConfirmed: false,
          LockoutEndDateUtc: null,
          LockoutEnabled: false,
          AccessFailedCount: 0
        },
//        PasswordConfrim: '',
        ruleCustom: {
          UserName: [
            {required: true, message: '必填'},
            {validator: Vue.$validate.required, trigger: 'blur'}
          ],
          FullName: [
            {required: true, message: '必填'},
            {validator: Vue.$validate.required, trigger: 'blur'}
          ],
          Password: [
            {validator: validatePass, trigger: 'blur'}
          ],
          PasswordConfrim: [
            {validator: validatePassCheck, trigger: 'blur'}
          ],
          SalesDepartment: [
            {required: false},
            {validator: Vue.$validate.required, trigger: 'blur'}
          ],
          Email: [
            {required: false},
            {validator: Vue.$validate.regEmail, trigger: 'blur'}
          ],
          PhoneNumber: [
            {required: false},
            {validator: Vue.$validate.regPhone, trigger: 'blur'}
          ]
        },
        senior: false,
        show: false
      }
    },
    beforeMount () {
//            防止组建先执行报错，放入子组建执行生成 vuex
      cVuex.registerModule(this, this.options, this.options.gridKey)
    },
    props: ['options'],
    mounted: function () {
      //            防止组建先执行报错，放入子组建执行生成 vuex
      cVuex.registerModule(this, this.options, this.options.gridKey)
    },
    computed: {
      getOptions () {
        return this.$store.state[this.options.gridKey]
      }
    },
    watch: {
      'getOptions.add_Window_Visible': {
        handler: function (val, oldVal) {
          this.show = val
        },
        deep: true
      }
    },
    methods: {
      handleSubmit (formName) {
        let _self = this
        let UserViewModel = Object.assign({}, _self.formCustom, {LockoutEndDateUtc: null})
        delete UserViewModel.PasswordConfrim
        this.$refs[formName].validate((valid) => {
          if (valid) {
            const apiUrl = Vue.$baseUrl.roleUrl + '/User/WUCC.CreateUser'
            o(apiUrl).post({UserViewModel: UserViewModel}).save().then(function (data) {
              _self.$Message.success('新增成功')
              _self.$store.dispatch(_self.options.gridKey + '_set_refresh')
              _self.setVisible() // 关闭弹窗
            })
          } else {
            console.log('error submit!!')
            return false
          }
        })
      },
      setVisible () {
        this.$store.dispatch(this.options.gridKey + '_add_Window_Visible')
        this.handleReset('formCustom') // 初始化表格
      },
      handleReset (name) {
        this.$refs[name].resetFields()
      }
    }
  }
</script>
<style type="text/css">
    .addLine {
        width: 100%;
        height: 1px;
        background: #e3e8ee;
        margin-bottom: 12px;
    }

    .ivu-tooltip-inner {
        max-width: 400px !important;
    }
</style>
