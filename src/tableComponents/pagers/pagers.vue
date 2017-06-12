<template>
    <div>
        <!--分页-->
        <div class="tablePager">
            <Page
                    :page-size="states.pager_Size"
                    :page-size-opts="states.pager_Opts"
                    :total="states.pager_Total"
                    :current="states.pager_CurrentPage"
                    show-elevator
                    show-sizer
                    show-total
                    @on-change="handleCurrentChange"
                    @on-page-size-change="handleSizeChange"
            ></Page>
        </div>
    </div>
</template>
<script>
    export default {
        data () {
            return {
                states: this.$store.state[this.options.gridKey]
            }
        },
        props: ['options'],
        computed: {
            getOptions () {
                return this.$store.state[this.options.gridKey]
            }
        },
        mounted () {
        },
        watch: {
        },
        methods: {
            handleSizeChange (val) {  // 每页显示条数变化事件
                this.$store.dispatch(this.options.gridKey + '_set_state_data', {pager_Size: val})
            },
            handleCurrentChange (val) {
                this.$store.dispatch(this.options.gridKey + '_set_state_data', {pager_CurrentPage: val})
            }
        }
    }
</script>
<style scoped>

</style>
