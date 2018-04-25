<template>
    <div>
        <el-dialog
            title="表格设置"
            class="formDialog"
            :close-on-click-modal="false"
            @close="setAddVisible"
            :visible.sync="show">
            <slot name="main">
                <div style="margin-bottom: 12px;">
                    <template v-for="(item, index) in checked">
                        <el-checkbox style="margin: 8px;" v-model="item.column" :label="item.title" border></el-checkbox>
                    </template>
                </div>
            </slot>
            <div style="text-align: right">
                <el-button @click="show = false">取 消</el-button>
                <el-button type="primary" @click="handleSubmit()">确 定</el-button>
            </div>
      </span>
        </el-dialog>
    </div>
</template>
<script>
    import clone from 'clone'
    export default {
        data() {
            return {
                show: false,
                checked: [],
            }
        },
        props: {
            // api接口
            options: Object,
        },
        updated() {
        },
        mounted: function () {
            this.tableshowFn()
        },
        computed: {
            gridKey (){
              return this.options.gridKey
            },
            getState() {
                return this.$store.state[this.options.gridKey]
            }
        },
        watch: {
            'getState.setting_Window_Visible': {
                handler: function (val, oldVal) {
                    this.show = val
                },
                deep: true
            }
        },
        methods: {
            tableshowFn () {
                // 获取 checked
                let _this = this
                let tableShowObj = JSON.parse(localStorage.getItem('TABLES_COLUMN')) || {}
                if(tableShowObj[this.gridKey]!==undefined){
                    _this.checked = tableShowObj[this.gridKey]
                } else {
                    _this.getState.table.forEach(function (value) {
                        let obj = {}
                        if(value.column === 'show') {
                            obj.column = true
                        } else {
                            obj.column = false
                        }
                        obj.title = value.title
                        _this.checked.push(obj)
                    })
                }

                // 执行
                this.setTabColumn()
            },
            setAddVisible(val) {
                this.$store.dispatch(this.options.gridKey + '_set_Window_Visible')
            },
            setTabColumn(){
                let _this = this
                let table = clone(this.getState.table)
                table = this.$common.setTabWidth(table,_this.gridKey)
                this.checked.forEach(function (val) {
                    table.forEach(function (item) {
                        if(val.title === item.title){
                            item.column = (val.column === false ? 'hide' : 'show')
                        }
                    })
                })

                this.$store.dispatch(this.options.gridKey + 'setData', {table: table})
            },
            handleSubmit(){
                this.setTabColumn()
                let saveKey = this.options.gridKey
                let saveObj = JSON.parse(localStorage.getItem('TABLES_COLUMN')) || {}
                saveObj[saveKey] = this.checked
                localStorage.setItem('TABLES_COLUMN',JSON.stringify(saveObj))
                this.$message({
                    showClose: true,
                    message: '保存成功',
                    type: 'success'
                })
                this.show = false
            }
        }
    }
</script>
<style scoped>

</style>
