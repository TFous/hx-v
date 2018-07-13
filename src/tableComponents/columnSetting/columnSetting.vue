<template>
    <div>
        <el-dialog
                title="表格设置"
                class="formDialog"
                :close-on-click-modal="false"
                @close="setAddVisible"
                :visible.sync="show">
            <el-tabs tab-position="left" style="min-height: 200px;">
                <el-tab-pane label="表格列展示">
                    <el-alert
                            style="margin-bottom: 12px;"
                            title="请根据个人需求合理展示表格列表。设置信息保存在当前浏览器"
                            type="success"
                            :closable="false">
                    </el-alert>
                    <div style="margin-bottom: 12px;">
                        <template v-for="(item, index) in checked">
                            <el-checkbox style="margin: 8px;" v-model="item.column" :label="item.title" border></el-checkbox>
                        </template>
                    </div>
                    <div style="text-align: right">
                        <el-button @click="show = false">取 消</el-button>
                        <el-button type="primary" @click="handleSubmit()">确 定</el-button>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="表格列宽度">
                    <div style="">
                        <el-alert
                                style="margin-bottom: 12px;"
                                :closable="false"
                                title="表格宽度和列数设置信息保存在当前浏览器，清空款存或者换一个浏览器表格状态则为初始状态"
                                type="error">
                        </el-alert>
                        <el-button type="primary" @click="recovery">恢复当前表格默认宽度</el-button>
                        <el-button type="danger" @click="recoveryAll">恢复所有表格默认宽度</el-button>
                    </div>
                </el-tab-pane>
            </el-tabs>

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
            recovery(){
                let table = JSON.parse(localStorage.getItem('TABLES_WIDTH')) || {}
                if(table[this.gridKey] !== undefined ){
                    delete table[this.gridKey]
                    localStorage.setItem('TABLES_WIDTH',JSON.stringify(table))
                    location.reload()
                    // this.$common.setTabWidth(this.getState.table,this.gridKey)
                }
            },
            recoveryAll(){
                localStorage.removeItem('TABLES_WIDTH')
                location.reload()
                // this.$common.setTabWidth(this.getState.table,this.gridKey)
            },
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
