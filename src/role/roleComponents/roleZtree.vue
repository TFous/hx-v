<template>
  <div>
    <Card>
      <p slot="title">权限设置</p>
      <div class="box-body">
        <div class="form-group">
          <label>权限类型</label>
          <Select v-model="selectedRoleTypeId" name="RoleType" id="RoleType">
            <Option v-for="roleType in roleTypes" :value="roleType.Id" :key="roleType.Id">
              {{ roleType.Description }}
            </Option>
          </Select>
        </div>

        <Button-group size="small" style="margin:12px 0px;">
          <Button title="全部展开" @click="expandAll(true)"><Icon type="arrow-expand"></Icon></Button>
          <Button title="全部收缩" @click="expandAll(false)"><Icon type="arrow-shrink"></Icon></Button>
          <Button title="收缩到1级" @click="expandTo(null, false, 0)">1</Button>
          <Button title="收缩到2级" @click="expandTo(null, false, 1)">2</Button>
          <Button title="收缩到3级" @click="expandTo(null, false, 2)">3</Button>
          <Button title="收缩到4级" @click="expandTo(null, false, 3)">4</Button>
        </Button-group>

        <div class="form-group">
          <ul id="roleTree"
              class="ztree"
              ref="roleTree"
          ></ul>
        </div>
      </div>
    </Card>
  </div>
</template>
<script>
  import o from 'o.js'
  import Vue from 'vue'
  //  let roleUrl = 'http://wucc.wdqh.com:6789/api/odata'
  export default {
    name: 'ztree',
    data () {
      // todo  拖动
      function beforeDrop(treeId, treeNodes, targetNode, moveType) {
        var targetId = targetNode.Id.toString()
        var id = treeNodes[0].Id
        var isOk = true
        // 如果移动类型为 成为其他节点的子节点 则调用后台修改父节点方法
        if (moveType === 'inner') {
          if (!confirm('确定要移动到[' + targetNode.Description + ']节点下？')) {
            return false
          }
          if (targetId !== null || targetId !== undefined) {
            const apiUrl = Vue.$baseUrl.roleUrl + '/Role/WUCC.ChangeParent'
            o(apiUrl).post({
              Id: `${id}`,
              ParentId: `${targetId}`
            }).save().then(function (e) {
              isOk = true
            })
          }
        } else {
          const apiUrl = Vue.$baseUrl.roleUrl + '/Role/WUCC.ChangeRoleOrder'
          o(apiUrl).post({
            Id: id,
            MoveType: moveType,
            TargetId: targetId
          }).save().then(function (e) {
            isOk = true
          })
        }
        return isOk
      }

      /**
       *   删除OK
       * @param treeId
       * @param treeNode
       * @returns {boolean}
       */
      function beforeRemove(treeId, treeNode) {
        var zTree = $.fn.zTree.getZTreeObj('roleTree')
        zTree.selectNode(treeNode)
        var isOk = false
        if (confirm('确认删除 节点:[' + treeNode.Description + ']吗？')) {
          const apiUrl = Vue.$baseUrl.roleUrl + '/Role/WUCC.Remove'
//      const apiUrl = Vue.$baseUrl.roleUrl + '/Role'
          const Id = treeNode.Id
//      o(apiUrl + '(\'' + Id + '\')').remove().save()
          o(apiUrl).post({
            Id: Id
          }).save()
        } else {
          return isOk
        }
      }

      function removeHoverDom(treeId, treeNode) {
        $('#addBtn_' + treeNode.tId).unbind().remove()
      }

      /**
       * 新增  // todo
       * @param treeId
       * @param treeNode
       */
      function addHoverDom(treeId, treeNode) {
        var sObj = $('#' + treeNode.tId + '_span')
        if (treeNode.editNameFlag || $('#addBtn_' + treeNode.tId).length > 0) return
        var addStr = '<span class="button add" id="addBtn_' + treeNode.tId + '" title="add node" onfocus="this.blur()"></span>'
        sObj.after(addStr)
        let code = sessionStorage.getItem('RoleKey')
//    var code = $('#RoleType').attr('data-code')
        var btn = $('#addBtn_' + treeNode.tId)
        if (btn) {
          btn.bind('click', function () {
            var data = {
              Id: '',
              PId: treeNode.Id,
              Name: code + '_' + newGuid(),
              Description: '新权限',
              RoleTypeId: getRoleTypeId()
            }
            const apiUrl = Vue.$baseUrl.roleUrl + '/Role/WUCC.SaveRole'
            o(apiUrl).post({
              RoleViewModel: {
                Id: data.Id,
                Name: data.Name,
                Description: data.Description,
                Pid: data.PId,
                RoleTypeId: Number(data.RoleTypeId)
              }
            }).save().then(function (jsonRs) {
              var obj = jsonRs.data
              data.Id = obj.Id
              var zTrees = $.fn.zTree.getZTreeObj('roleTree')
              var newNodes = zTrees.addNodes(treeNode, data)
              var current = newNodes[0]
              zTrees.selectNode(current)
              // 刷新本地缓存
              initVal(current)
              return false
            })
          })
        }
      }

      function initVal(treeNode) {
//          Vue.set(vm, {
//            'selectedRoleTypeId': -1
//          })
//        console.log(vm)
        let str = JSON.stringify(treeNode)
        sessionStorage.setItem('RoleObj', str)
        let t2, t4
        if (treeNode.Name.split('_')[0] === 'undefined') {
          t2 = sessionStorage.getItem('RoleKey')
          t4 = `${sessionStorage.getItem('RoleKey')}_${treeNode.Name.split('_')[1]}`
        } else {
          t2 = treeNode.Name.split('_')[0]
          t4 = treeNode.Name
        }
        $('#text1 input').val(treeNode.Description)
        $('#text2').html(t2)
        $('#text3 input').val(treeNode.Name.split('_')[1])
        $('#text4 input').val(t4)
      }

      // todo 点击传值
      function onClick(event, treeId, treeNode, clickFlag) {
        if (treeNode.Id !== '00000000-0000-0000-0000-000000000000') {
          initVal(treeNode)
        }
      }

      //  JS生成GUID函数,类似.net中的NewID()
      function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
      }

      function newGuid() {
        return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
      }

      function getRoleTypeId() {
        return $('#RoleType').val()
      }

      return {
        roleTypes: [],
        selectedRoleType: null,
        selectedRoleTypeId: -1,
        setting: {
          view: {
            expandSpeed: '',
            addHoverDom: addHoverDom,
            removeHoverDom: removeHoverDom,
            selectedMulti: false
          },
          edit: {
            enable: true,
            showRenameBtn: false
          },
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
          callback: {
            beforeRemove: beforeRemove,
            onClick: onClick,
            beforeDrop: beforeDrop
          }
        }
      }
    },
    mounted: function () {
      this.getRoleClass()
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
      expandAll: function (value) {
        var zTree = $.fn.zTree.getZTreeObj('roleTree')
        if (zTree) {
          zTree.expandAll(value)
        }
      },
      zTreeExpande: function (zTreeObj, node, level) {
        var currentLevel = level
        // 当前节点展开
        zTreeObj.expandNode(node, true, true, true)
        var children = node.children
        if (children && children.length > 0) {
          level--
          for (var i in children) {
            var childNode = children[i]
            if (currentLevel === 0) {
              zTreeObj.expandNode(childNode, false, true, true)
            } else {
              this.zTreeExpande(zTreeObj, childNode, level)
            }
          }
        }
      },
      expandTo: function (parentNode, value, level) {
        //  收缩全部
        this.expandAll(false)

        //  获取zTree对象
        var zTree = $.fn.zTree.getZTreeObj('roleTree')

        if (!zTree) {
          return
        }

        //  当前层级的nodes
        var nodes = zTree.getNodes()

        if (nodes.length > 0) {
          for (var i in nodes) {
            var node = nodes[i]
            this.zTreeExpande(zTree, node, level)
          }
        }
      },
      selectedRoleType: function (selectId) {
        this.roleTypes.filter((item) => {
          if (item.Id === selectId) {
            return item
          }
        })
      },
      reset () { // todo 清空sessionStorage
        $('#text1 input').val('')
        $('#text2').html('')
        $('#text3 input').val('')
        $('#text4 input').val('')
      }
    },
    computed: {},
    watch: {
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
          this.reset()
          if (roleTypeId > 0) {
            const apiUrl = Vue.$baseUrl.roleUrl + '/Role/WUCC.QueryRoles'
            o(apiUrl).post({
              RoleTypeId: Number(roleType[0].Id),
              UserId: null
            }).save().then(function (result) {
              const zTreeDom = _this.$refs.roleTree
              let zTree = $.fn.zTree.init($(zTreeDom), _this.setting, result.data)
              zTree.expandAll(true)
            })
          }
        }
      }
    }
  }
</script>
