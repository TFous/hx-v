<template>
    <div>
        <Row>
            <Col span="7">
            <Card>
                <p slot="title" class="ctit">权限模块</p>
                <ul>
                    <li class="selectRoleType" v-for="item in roleTypes">
                     <span @click="selectRoleType(item.Id,item.Description)">
                    <Icon type="ios-star"></Icon>
                    {{ item.Description }}
                    </span>
                    </li>
                </ul>
            </Card>
            </Col>
            <Col span="1">&nbsp;
            </Col>
            <Col span="16">
            <Card>
                <p slot="title" class="ctit">{{rightTitle}}</p>
                <div class="group">
                    <p class="actionType">模板处理方式</p>
                    <div>
                        <Radio-group v-model="actionType">
                            <Radio label="replace">
                                <span>替换</span>
                            </Radio>
                            <Radio label="add">
                                <span>叠加</span>
                            </Radio>
                        </Radio-group>
                    </div>
                </div>
                <div class="group">
                    <p class="actionType">选择模板</p>
                    <Select v-model="selectedRoleTypeId" placeholder="请输入内容" class="selectOp">
                        <template v-for="a in roleTemplate">
                            <Option
                                    :key="RoleTypeId"
                                    :label="a.Name"
                                    :value="a.Id">
                            </Option>
                        </template>
                    </Select>
                </div>
                <div class="group">
                    <input type="hidden" id="checkedRoles" name="checkedRoles"/>
                    <ul id="roleTree"
                        class="ztree"
                        ref="roleTree"
                    ></ul>
                </div>
                <div class="group">
                    <Button type="primary" @click="handleSubmit('formCustom')">保存</Button>
                </div>
            </Card>
            </Col>
        </Row>
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

  function onCheck (event, treeId, treeNode) {
    var idArr = []
    var treeObj = $.fn.zTree.getZTreeObj('roleTree')
    var nodes = treeObj.getCheckedNodes(true)
    for (var i in nodes) {
      idArr.push(nodes[i].Id)
    }
    $('#checkedRoles').val(idArr.join())
  }
//  let roleUrl = 'http://wucc.wdqh.com:6789/api/odata'
  import o from 'o.js'
  import zTree from 'ztree'
  import Vue from 'vue'
  export default {
    data () {
      return {
        ztree: zTree,
        UserId: '',
        selectedRoleTypeId: -1,
        roleTypes: '',
        roleTypeItem: '',  // 选中的对象
        templateType: '', // 模板选择下拉
        RoleTypeId: '',
        rightTitle: '权限',
        actionType: 'replace',
        roleArr: '',  // 存储 默认role
        roleTemplate: []  // 模版信息
      }
    },
    props: ['options'],
    mounted: function () {
    },
    computed: {
      getOptions () {
        return this.$store.state[this.options.gridKey]
      }
    },
    watch: {
      'getOptions.edit_Window_Visible': {
        handler: function (val, oldVal) {
          this.getRoleClass()
          this.roleTemplate = []
          this.UserId = this.getOptions.edit_Window_Data.Id
        },
        deep: false
      },
//      选择模板
      'selectedRoleTypeId': function (selectId) {
        let _this = this
        if (_this.roleTypeItem) {
          $.fn.zTree.destroy()
          var roleTypeId = _this.roleTypeItem[0].Id
          sessionStorage.setItem('RoleKey', _this.roleTypeItem[0].Code)
          if (roleTypeId > 0) {
            const apiUrl = Vue.$baseUrl.roleUrl + '/Role/WUCC.QueryRoles'
            o(apiUrl).post({
              RoleTypeId: Number(_this.roleTypeItem[0].Id),
              UserId: null
            }).save().then(function (result1) {
              const apiUrl1 = Vue.$baseUrl.roleUrl + '/RoleTemplate/WUCC.GetTemplateRoles'
              if (selectId < 0 || selectId === '') {
                return
              }
              o(apiUrl1).post({
                Id: selectId
              }).save().then(function (result) {
                $.fn.zTree.destroy()
                var checkedArr = result.data
                $('#checkedRoles').val(checkedArr.join())
                var checked = checkedArr
                var data = result1.data
                for (let i = 0; i < data.length; i++) {
                  for (let j = 0; j < checked.length; j++) {
                    if (data[i].Id === checked[j]) {
                      data[i].checked = true
                    }
                  }
                }
                if (_this.actionType === 'add') {
                  let roleArr = _this.roleArr
                  for (let j = 0; j < roleArr.length; j++) {
                    if (roleArr[j].Checked) {
                      for (let i = 0; i < data.length; i++) {
                        if (data[i].Id === roleArr[j].Id) {
                          data[i].checked = true
                        }
                      }
                    }
                  }
                }
                const zTreeDom = _this.$refs.roleTree
                let zTree = $.fn.zTree.init($(zTreeDom), setting, data)
                zTree.expandAll(true)
              })
            })
          }
        }
      }
    },
    methods: {
//      获取权限模版
      getRoleTemplate: function (RoleTypeId) {
        let _this = this
        let url = Vue.$baseUrl.roleUrl + `/RoleTemplate?$filter=RoleTypeId eq ${RoleTypeId}`
        o(url).get(function (data) {
          _this.roleTemplate = data
          let defaultOption = {Id: -1, Name: '请选择...'}
          _this.roleTemplate.splice(0, 0, defaultOption)
          _this.selectedRoleTypeId = -1
        })
      },
      // 权限模块 下拉
      getRoleClass: function () {
        let _this = this
        const apiUrl = Vue.$baseUrl.roleUrl + '/RoleType'
        o(apiUrl).get(function (data) {
          _this.roleTypes = data
        })
      },
      // 选择权限模块 触发
      selectRoleType (selectId, Description) {
        let _this = this
        _this.rightTitle = Description
        var roleType = this.roleTypes.filter((item) => {
          if (item.Id === selectId) {
            return item
          }
        })
        if (roleType) {
          _this.roleTypeItem = roleType
          this.getRoleTemplate(selectId)
          $.fn.zTree.destroy()
          var roleTypeId = roleType[0].Id
          if (roleTypeId > 0) {
            const apiUrl = Vue.$baseUrl.roleUrl + '/Role/WUCC.QueryRoles'
            o(apiUrl).post({
              RoleTypeId: Number(roleType[0].Id),
              UserId: _this.UserId
            }).save().then(function (result) {
              _this.roleArr = result.data
              $.fn.zTree.destroy()
              var checkedArr = result.data
              $('#checkedRoles').val(checkedArr.join())
              var data = result.data
              for (var i = 0; i < data.length; i++) {
                data[i].checked = data[i].Checked
              }
              const zTreeDom = _this.$refs.roleTree
              let zTree = $.fn.zTree.init($(zTreeDom), setting, data)
              zTree.expandAll(true)
            })
          }
        }
      },
      setVisible () {
        this.$store.dispatch(this.options.gridKey + '_edit_Window_Visible')
      },
      handleSubmit () {
        let _self = this
        let userId = _self.getOptions.edit_Window_Data.Id
        const apiUrl = Vue.$baseUrl.roleUrl + `/User('${userId}')/WUCC.UpdateUserRole`
        let CheckedRoles = $('#checkedRoles').val().split(',')
        let arr = []
        for (let i = 0; i < CheckedRoles.length; i++) {
          arr.push(`${CheckedRoles[i]}`)
        }
        let selectedRoles = JSON.stringify(arr)
        o(apiUrl).post({
          SelectedRoles: selectedRoles,
          RoleTypeId: _self.roleTypeItem[0].Id
        }).save().then(function (data) {
          _self.$Message.success('保存成功')
        })
      },
      handleReset (name) {
        this.$refs[name].resetFields()
      }
    }
  }
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    .selectRoleType {
        height: 30px;
        line-height: 30px;
        cursor: pointer;
        &:hover {
            color: #00acd6;
        }
    }

    .ctit {
        font-size: 14px;
    }

    .actionType {
        font-weight: 700;
        padding: 12px 0px;
    }

    .selectOp .ivu-select-dropdown {
        position: absolute !important;
    }
</style>

