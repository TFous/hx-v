<template>
  <div>
    <Card>
      <p slot="title">权限详情</p>
      <div class="box-body">
        <div id="roleDetails">
          <form>
            <div class="form-group">
              <label>说明</label>
              <Input id="text1" v-model="RoleObj.Description"></Input>
            </div>
            <div class="form-group">
              <label>前缀</label>
              <p class="text-green" id="text2">
                <!--{{prefix}}-->
              </p>
            </div>

            <div class="form-group">
              <label>权限</label>
              <Input id="text3" v-model="name1"></Input>
            </div>

            <div class="form-group">
              <label>实际权限</label>
              <Input id="text4" v-model="RoleObj.Name" readonly></Input>
            </div>
            <Button type="primary" v-on:click="save">保存</Button>
          </form>
        </div>
      </div>
    </Card>
  </div>
</template>
<script>
  import o from 'o.js'
  import Vue from 'vue'
  //  import zTree from 'ztree'
  //  let roleUrl = 'http://wucc.wdqh.com:6789/api/odata'
  //  console.log('zTree' + zTree)
  export default {
    data () {
      sessionStorage.removeItem('RoleObj')
      let roleObj = {
        Description: '',
        Id: '',
        Name: '',
        Order: '',
        Pid: '',
        RoleTypeId: '',
        tId: '',    // ztree 更新
        Users: []
      }
      if (sessionStorage.getItem('RoleObj')) {
        let str = sessionStorage.getItem('RoleObj')
        roleObj = JSON.parse(str)
      }
      return {
        RoleObj: {
          Description: roleObj.Description,
          Id: roleObj.Id,
          Name: roleObj.Name,
          Order: roleObj.Order,
          Pid: roleObj.Pid,
          RoleTypeId: roleObj.RoleTypeId,
          Users: roleObj.Users
        },
        name1: roleObj.Name.split('_')[1],
        tId: roleObj.tId
      }
    },
    mounted: function () {
    },
    watch: {
      'name1': {
        handler: function (val, oldVal) {
          this.RoleObj.Description = $('#text1 input').val()
          this.RoleObj.Name = `${sessionStorage.getItem('RoleKey')}_${val}`
        },
        deep: true
      },
      'RoleObj.Description': {
        handler: function (val, oldVal) {
          this.name1 = $('#text3 input').val()
        },
        deep: true
      }
    },
    computed: {},
    methods: {
      // todo 保存  id wenti
      save: function () {
        var self = this
        //  后台保存数据
        let str = sessionStorage.getItem('RoleObj')
        let roleObj = JSON.parse(str)
        const apiUrl = Vue.$baseUrl.roleUrl + `/Role/WUCC.SaveRole`
        let newObj = Object.assign({}, {
          Description: this.RoleObj.Description,
          Id: roleObj.Id,
          Name: this.RoleObj.Name,
          Order: roleObj.Order,
          Pid: roleObj.Pid,
          RoleTypeId: roleObj.RoleTypeId,
          Users: roleObj.Users
        })
//        console.log('newObj========================')
//        console.log(newObj)
        o(apiUrl).post({RoleViewModel: newObj}).save().then(function (jsonRs) {
          var zTree = $.fn.zTree.getZTreeObj('roleTree')
          var node = zTree.getNodeByTId(roleObj.tId)
//          console.log(jsonRs)
          if (node) {
            node.Name = self.RoleObj.Name
            node.Description = self.RoleObj.Description
            zTree.updateNode(node)
          }
        })
      },
      reset: function () {
        this.name = ''
        this.description = ''
        this.tId = null
        this.pId = null
        this.roleTypeId = 0
      },
      selectInput: function (e) {
        e.target.select()
      }
    }
  }
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss" scoped>
  .form-group{
    margin:6px 0px;
  }
</style>
