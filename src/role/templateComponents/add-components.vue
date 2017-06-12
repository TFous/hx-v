<template>
  <div>
    <Modal
      v-model="show"
      :title="'新增 - '+options.title"
      @on-cancel="setAddVisible"
      :mask-closable="false"
      width="980"
    >
      <div class="add">
        <Row>
          <Col span="24">
          <div class="box-body">
            <div class="row item_input_row">
              <Form ref="addForm"
                    :model="dataMsg"
                    :label-width="120">
                <template v-for="(item, key, index) in options.arr" v-if="item.add_hide!==1">
                  <div style="width:50%; float: left;height: 57px;">
                    <template v-if="item.type ==='data'">
                      <Form-item
                        :prop="item.key"
                        :label="item.title"
                        :rules="item.rules"
                      >
                        <Date-picker
                          :editable="false"
                          type="date"
                          placeholder="选择日期"
                          v-model="dataMsg[item.key]">
                        </Date-picker>
                      </Form-item>
                    </template>
                    <template v-else-if="item.type ==='select'">
                      <Form-item
                        :prop="item.key"
                        :label="item.title"
                        :rules="item.rules"
                      >
                        <Select v-model="dataMsg[item.key]" placeholder="请输入内容">
                          <Option
                            :key="key"
                            v-for="a in options[item.key]"
                            :label="a.label"
                            :value="a.values">
                          </Option>
                        </Select>
                      </Form-item>
                    </template>
                    <template v-else-if="item.type ==='number'">
                      <Form-item
                        :prop="item.key"
                        :label="item.title"
                        :rules="item.rules"
                      >
                        <Input-number
                          v-model="dataMsg[item.key]"
                          placeholder="请输入内容"
                        ></Input-number>
                      </Form-item>
                    </template>
                    <template v-else>
                      <Form-item
                        :prop="item.key"
                        :label="item.title"
                        :rules="item.rules"
                      >
                        <Input
                          v-model="dataMsg[item.key]"
                          placeholder="请输入内容"
                        ></Input>
                      </Form-item>
                    </template>
                  </div>
                </template>
                <template>
                  <div class="clearfix"></div>
                  <Form-item
                    prop="RoleTypeId"
                    label="权限类型"
                  >
                    <Select v-model="selectedRoleTypeId" placeholder="请输入内容">
                      <Option
                        :key="RoleTypeId"
                        v-for="a in roleTypes"
                        :label="a.Description"
                        :value="a.Id">
                      </Option>
                    </Select>
                  </Form-item>
                </template>
                <template>
                  <div style="margin-left: 120px;">
                    <input type="hidden" id="checkedRoles" name="checkedRoles"/>
                    <ul id="roleTree"
                        class="ztree"
                        ref="roleTree"
                    ></ul>
                  </div>
                </template>
              </Form>
            </div>
          </div>
          </Col>
        </Row>
      </div>
      <div slot="footer">
        <Button @click="setAddVisible">取消</Button>
        <Button type="primary" @click="handleSubmit('addForm')">提交</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  var setting = {
    data: {
      simpleData: {
        enable: true,
        idKey: 'Id',
        pIdKey: 'Pid',
        rootPid: ''
      },
      key: {
        name: 'Description'
      }
    },
    check: {
      enable: true
    },
    callback: {
      onCheck: onCheck
    }
  }

  function onCheck(event, treeId, treeNode) {
    var treeObj = $.fn.zTree.getZTreeObj('roleTree')
    var nodes = treeObj.getCheckedNodes(true)
    var idArr = []
    for (var i in nodes) {
      idArr.push(nodes[i].Id)
    }
    $('#checkedRoles').val(idArr.join())
  }

  import * as cVuex from '../../tableComponents/xVuex.js'
  import * as common from '../../tableComponents/common.js'
  import o from 'o.js'
  import Vue from 'vue'
  //  let roleUrl = 'http://wucc.wdqh.com:6789/api/odata'
  export default {
    data () {
      return {
        roleTypes: [],
        selectedRoleType: null,
        selectedRoleTypeId: -1,
        RoleTypeId: '',
        show: false,
        dataMsg: Object
      }
    },
    props: ['options'],
    beforeMount () {
//            防止组建先执行报错，放入子组建执行生成 vuex
      cVuex.registerModule(this, this.options, this.options.gridKey)
//            表单对象
      this.dataMsg = common.filterData(this.getOptions.arr)
    },
    mounted: function () {
      cVuex.registerModule(this, this.options, this.options.gridKey)
      this.dataMsg = common.filterData(this.getOptions.arr)
      this.getRoleClass()
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
      },
      'selectedRoleTypeId': function (selectId) {
        let _this = this
        var roleType = this.roleTypes.filter((item) => {
          if (item.Id === selectId) {
            return item
          }
        })
        if (roleType) {
          $.fn.zTree.destroy()
          var roleTypeId = roleType[0].Id
          sessionStorage.setItem('RoleKey', roleType[0].Code)
          if (roleTypeId > 0) {
            const apiUrl = Vue.$baseUrl.roleUrl + '/Role/WUCC.QueryRoles'
            o(apiUrl).post({
              RoleTypeId: Number(roleType[0].Id),
              UserId: null
            }).save().then(function (result) {
              const zTreeDom = _this.$refs.roleTree
              let zTree = $.fn.zTree.init($(zTreeDom), setting, result.data)
              zTree.expandAll(true)
            })
          }
        }
      }
    },
    methods: {
      getRoleClass: function () {
        let _this = this
        const apiUrl = Vue.$baseUrl.roleUrl + '/RoleType'
        o(apiUrl).get(function (data) {
          _this.roleTypes = data
          let defaultOption = {Id: -1, Description: '请选择...'}
          _this.roleTypes.splice(0, 0, defaultOption)
          _this.selectedRoleTypeId = -1
        })
      },
      setAddVisible (val) {
        this.$store.dispatch(this.options.gridKey + '_add_Window_Visible')
        this.selectedRoleTypeId = -1
        this.handleReset('addForm') // 初始化表格
      },
      handleSubmit (formName) {
        let _self = this
        this.$refs[formName].validate((valid) => {
          if (valid) {
            const apiUrl = Vue.$baseUrl.roleUrl + '/RoleTemplate/WUCC.Create'
            let CheckedRoles = $('#checkedRoles').val()
            o(apiUrl).post({
              RoleTemplate: {
                Name: _self.dataMsg.Name,
                RoleTypeId: _self.selectedRoleTypeId,
                Description: _self.dataMsg.Description
              },
              CheckedRoles: CheckedRoles
            }).save().then(function (data) {
              _self.$Message.success('新增成功')
              _self.$store.dispatch(_self.options.gridKey + '_set_refresh')
              _self.setAddVisible() // 关闭弹窗
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
<style scoped>

</style>
