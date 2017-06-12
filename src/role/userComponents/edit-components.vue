<template>
    <div>
        <Modal
                v-model="show"
                :title="'编辑 - '+ title +' - '+getOptions.edit_Window_Data.UserName"
                @on-cancel="setVisible"
                :mask-closable="false"
                width="980"
        >
            <Tabs type="card">
                <Tab-pane label="账号信息">
                    <base-msg :options="options"></base-msg>
                </Tab-pane>
                <Tab-pane label="权限分配">
                    <role :options="options"></role>
                </Tab-pane>
                <!--<Tab-pane label="用户扩展信息(Claims)">-->
                <!--<claims :options="options"></claims>-->
                <!--</Tab-pane>-->
            </Tabs>
            <div slot="footer"></div>
        </Modal>
    </div>
</template>
<script>
  import baseMsg from './userManager/baseMsg.vue'
  import role from './userManager/role.vue'
  export default {
    data () {
      return {
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
          this.show = val
        },
        deep: false
      }
    },
    components: {
      'base-msg': baseMsg,
      'role': role
    },
    methods: {
      setVisible () {
        this.$store.dispatch(this.options.gridKey + '_edit_Window_Visible')
        $('#roleTree').empty()
      }
    }
  }
</script>
<style scoped>

</style>
