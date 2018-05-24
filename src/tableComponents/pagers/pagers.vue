<template>
    <div>
        <!--分页-->
        <div class="tablePager" v-show="show">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="getOptions.pager_CurrentPage"
            :page-sizes="getOptions.pager_size_opts"
            :page-size="getOptions.pager_Size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="getOptions.pager_Total">
          </el-pagination>
        </div>
    </div>
</template>
<script>
    export default {
        data () {
            return {
                show:true
            }
        },
        props: ['options'],
        computed: {
            getOptions () {
                return this.$store.state[this.options.gridKey]
            }
        },
        mounted () {
            this.show = (this.getOptions.tableData.length === 0 ? false : true)
        },
        watch: {
            'getOptions.tableData': {
               handler: function (val, oldVal) {
                 if (oldVal !== undefined) {
                     this.show = (val.length === 0 ? false : true)
                 }
               },
               deep: true
             },
        },
        methods: {
            handleSizeChange (val) {  // 每页显示条数变化事件
                this.$store.dispatch(this.options.gridKey + 'setData', {pager_Size: val})
            },
            handleCurrentChange (val) { // 页数变化
                this.$store.dispatch(this.options.gridKey + 'setData', {pager_CurrentPage: val})
            }
        }
    }
</script>
<style scoped>

</style>
