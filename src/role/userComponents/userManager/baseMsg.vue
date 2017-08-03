<template>
  <div>
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
                <Col span="11">
                <Form-item label="登录名" prop="UserName">
                  {{formCustom.UserName}}   <span class="item">(登录系统的账号名)</span>
                  <!--<Input v-model="" placeholder="请输入姓名"></Input>-->
                </Form-item>
                </Col>
                <Col span="11">
                <Form-item label="姓名" prop="FullName">
                  <Input v-model="formCustom.FullName" placeholder="请输入姓名"></Input>
                </Form-item>
                </Col>
                <Col span="11">
                <Form-item label="部门" prop="SalesDepartment">
                  <Input v-model="formCustom.SalesDepartment" placeholder="请输入姓名"></Input>
                </Form-item>
                </Col>
                <!--<Col span="11">-->
                <!--<Form-item label="超级管理员" prop="IsSuperAdmin">-->
                  <!--<Tooltip content="超级管理员拥有全部权限，可以进行任何操作">-->
                    <!--<i-switch v-model="formCustom.IsSuperAdmin"></i-switch>-->
                  <!--</Tooltip>-->
                <!--</Form-item>-->
                <!--</Col>-->
                <Col span="11">
                <Form-item label="管理员" prop="IsManager">
                  <Tooltip content="管理员可以管理自己创建的用户,并将自己的权限赋予该账户">
                    <i-switch v-model="formCustom.IsManager"></i-switch>
                  </Tooltip>
                </Form-item>
                </Col>
                <Col span="11">
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
                    <i-switch v-model="senior"></i-switch>
                </Form-item>
                </Col>
                <template v-if="senior">
                  <Col span="11">
                  <Form-item label="锁定结束时间Utc" prop="LockoutEndDateUtc">
                    <Date-picker class="timeWrap" :editable="false" v-model="formCustom.LockoutEndDateUtc" type="date"
                                 placeholder="选择日期" style="width: 200px"></Date-picker>
                  </Form-item>
                  </Col>
                  <Col span="11">
                  <Form-item label="锁定结束本地时间" prop="LockoutEnabled">
                    <i-switch v-model="formCustom.LockoutEnabled"></i-switch>
                  </Form-item>
                  </Col>
                  <Col span="11">
                  <Form-item label="电子邮件" prop="Email">
                    <Input v-model="formCustom.Email" placeholder="请输入姓名"></Input>
                  </Form-item>
                  </Col>
                  <Col span="11">
                  <Form-item label="邮件是否认证" prop="EmailConfirmed">
                    <i-switch v-model="formCustom.EmailConfirmed"></i-switch>
                  </Form-item>
                  </Col>
                  <Col span="11">
                  <Form-item label="电话号码" prop="PhoneNumber">
                    <Input v-model="formCustom.PhoneNumber" placeholder="请输入姓名"></Input>
                  </Form-item>
                  </Col>
                  <Col span="11">
                  <Form-item label="电话号码是否认证" prop="PhoneNumberConfirmed">
                    <i-switch v-model="formCustom.PhoneNumberConfirmed"></i-switch>
                  </Form-item>
                  </Col>
                  <Col span="11">
                  <Form-item label="登录失败次数" prop="AccessFailedCount">
                    <Input v-model="formCustom.AccessFailedCount" placeholder="请输入姓名"></Input>
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
      <Row>
        <Col span="22">
        <Button @click="setVisible">取消</Button>
        <Button type="primary" @click="handleSubmit('formCustom')">提交修改</Button>
        </Col>
      </Row>
    </div>
  </div>
</template>
<script>
  //  let roleUrl = 'http://wucc.wdqh.com:6789/api/odata'
  import o from 'o.js'
  import Vue from 'vue'
  export default {
    data () {
      return {
        formCustom: {
          UserName: '',
          Id: null,
          FullName: '',
//          Password: '',
//          PasswordConfrim: '',
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
        ruleCustom: {
          UserName: [
            {required: true, message: '必填'},
            {validator: Vue.$validate.required, trigger: 'blur'}
          ],
          FullName: [
            {required: true, message: '必填'},
            {validator: Vue.$validate.required, trigger: 'blur'}
          ],
          SalesDepartment: [
            {required: false},
            {validator: Vue.$validate.required, trigger: 'blur'}
          ],
          Email: [
            {required: false},
            {validator: Vue.$validate.regEmail}
          ],
          PhoneNumber: [
            {required: false},
            {validator: Vue.$validate.regPhone}
          ]
        },
        senior: false,
        show: false,
        dataMsg: {},
        selectedRoleTypeId: '',
        roleTypes: '',
        RoleTypeId: '',
        title: ''
      }
    },
    props: ['options'],
    mounted: function () {
      this.title = this.getOptions.edit_Window_Data.Name || this.options.title
    },
    computed: {
      getOptions () {
        return this.$store.state[this.options.gridKey]
      }
    },
    watch: {
      'getOptions.edit_Window_Visible': {
        handler: function (val, oldVal) {
          this.handleReset('formCustom') // 初始化表格
          this.getMsg()
        },
        deep: false
      }
    },
    methods: {
      getMsg () {
        let _self = this
        const apiUrl = Vue.$baseUrl.roleUrl + `/User('${this.getOptions.edit_Window_Data.Id}')`
        o(apiUrl).get(function (data) {
          Object.assign(_self.formCustom, data)
        })
      },
      setVisible () {
        this.$store.dispatch(this.options.gridKey + '_edit_Window_Visible')
        this.handleReset('formCustom') // 初始化表格
      },
      handleSubmit (formName) {
        let _self = this
        if (_self.formCustom.LockoutEndDateUtc === ''){
          _self.formCustom.LockoutEndDateUtc = null
        }
        let UserViewModel = Object.assign({}, _self.formCustom)
//        delete UserViewModel['Roles']
//        delete UserViewModel['Logins']
//        delete UserViewModel['@odata.context']
        this.$refs[formName].validate((valid) => {
          if (valid) {
            const apiUrl = Vue.$baseUrl.roleUrl + `/User('${this.getOptions.edit_Window_Data.Id}')`
            o(apiUrl).patch(UserViewModel).save().then(function (data) {
              _self.$Message.success('修改成功')
              _self.$store.dispatch(_self.options.gridKey + '_set_refresh')
              _self.setVisible() // 关闭弹窗
            })
          } else {
            console.log('error submit!!')
            return false
          }
        })
      },
      handleReset (name) {
        this.$refs[name].resetFields()
      }
    }
  }
</script>
<style>
  .edit .ivu-tooltip-popper {
    position: absolute !important;
  }
  .item_input_row .ivu-col-span-11{
    height:56px;
  }
  .item {
    color: #999;
    margin-left: 12px;
  }
</style>
