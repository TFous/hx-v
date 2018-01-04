<template>
    <div>
        <el-dialog
            :title="'详情 - '+ title"
            class="formDialog details"
            @close="setVisible"
            :close-on-click-modal="false"
            :visible.sync="show"
        >
            <slot name="main">
                <el-form ref="detailsLayer" :label-position="labelPosition" label-width="150px" :model="dataMsg"
                         class="pl100">
                    <template v-for="(item, key, index) in getState.table" v-if="item.detailsLayer!=='hide' && item.key!=='action' && item.key!=='selection'">
                        <div class="xtable-left">
                                <el-form-item
                                    :prop="item.key"
                                    :label="item.title"
                                    :rules="item.rules"
                                >
                                    {{dataMsg[item.key]}}
                                </el-form-item>
                        </div>
                    </template>
                </el-form>
            </slot>
            <span slot="footer" class="dialog-footer">
        <el-button @click="show = false">关 闭</el-button>
        <el-button type="primary" @click="setEdit('detailsLayer')">修 改</el-button>
      </span>
        </el-dialog>
    </div>
</template>
<script>
    import * as common from '../common.js'
    import * as xVuex from '../xVuex.js'
    import Vue from 'vue'

    export default {
        data() {
            return {
                labelPosition: 'right', // label 对齐方式
                show: false,
                dataMsg: {},
                title: ''
            }
        },
        props: {
            // api接口
            options: Object
        },
        beforeMount() {
        },
        mounted: function () {
            this.title = this.getState.details_Window_Data.Name || this.options.title
        },
        computed: {
            getParent() {
                return this.$parent
            },
            getState() {
                return this.$store.state[this.options.gridKey]
            }
        },
        watch: {
            'getState.details_Window_Visible': {
                handler: function (val, oldVal) {
                    this.show = val
                    if (val === true) {
                        /**
                         * 编辑对象，从this.getState.table 筛选出必须的传给后台，过滤调其他方法新加的一些属性
                         * @type {{}}
                         */
                        let o = {}
                        for (let attr in this.getState.details_Window_Data) {
                            for (let item of this.getState.table) {
                                if (item.key) {
                                    if (item.key === attr) {
                                        o[item.key] = this.getState.details_Window_Data[item.key]
                                    }
                                }
                            }
                        }
                        this.dataMsg = Object.assign({}, o)
                    } else {
                        this.dataMsg = {}
                    }
                },
                deep: false
            }
        },
        methods: {
            setEdit () {
                this.show = false
                this.$store.dispatch(this.options.gridKey + '_edit_Window_Visible',this.getState.details_Window_Data)
            },
            setVisible() {
                this.$store.dispatch(this.options.gridKey + '_details_Window_Visible')
            }
        }
    }
</script>
<style scoped>

</style>
