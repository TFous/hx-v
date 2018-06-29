<template>
    <div>
        <el-dialog
                :title="'编辑 - '+ title"
                class="formDialog"
                @close="setVisible"
                :close-on-click-modal="false"
                :visible.sync="show"
        >
            <slot name="main">
                <el-form ref="editLayer" :label-position="labelPosition" label-width="150px" :model="dataMsg"
                         class="pl100">
                    <template v-for="(item, key, index) in getState.table" v-if="item.editLayer!=='hide'">
                        <div class="xtable-left">
                            <template v-if="item.type ==='date'">
                                <el-form-item
                                        :prop="item.key"
                                        :label="item.title"
                                        :rules="item.rules"
                                >
                                    <div class="block">
                                        <el-date-picker
                                            value-format="yyyy-MM-dd"
                                                :disabled="item.readOnly"
                                                :clearable="item.readOnly===true?false:true"
                                                :editable="false"
                                                v-model="dataMsg[item.key]"
                                                type="date"
                                                placeholder="选择日期"
                                        >
                                        </el-date-picker>
                                    </div>
                                </el-form-item>
                            </template>
                            <template v-else-if="item.type ==='select'">
                                <el-form-item
                                        :prop="item.key"
                                        :label="item.title"
                                        :rules="item.rules"
                                >
                                    <el-select
                                            :clearable="true"
                                            :disabled="item.readOnly"
                                            v-model="dataMsg[item.key]" placeholder="请选择">
                                        <el-option
                                                v-for="a in item.selects"
                                                :key="a.value"
                                                :label="a.text"
                                                :value="a.value"
                                        >
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                            </template>
                            <template v-else-if="item.type ==='number'">
                                <el-form-item
                                        :prop="item.key"
                                        :label="item.title"
                                        :rules="item.rules"
                                >
                                    <el-input
                                            :disabled="item.readOnly"
                                            :clearable="item.readOnly===true?false:true"
                                            v-model="dataMsg[item.key]"
                                            placeholder="请输入内容"
                                            @change="setNumber(item.key)"
                                    ></el-input>
                                </el-form-item>
                            </template>
                            <template v-else-if="item.type ==='textarea'">
                                <el-form-item
                                        :prop="item.key"
                                        :label="item.title"
                                        :rules="item.rules"
                                >
                                    <el-input
                                            :disabled="item.readOnly"
                                            :clearable="item.readOnly===true?false:true"
                                            type="textarea"
                                            v-model="dataMsg[item.key]"
                                            placeholder="请输入内容"
                                    ></el-input>
                                </el-form-item>
                            </template>
                            <template v-else-if="item.type ==='remoteMethod'">
                                <el-form-item
                                        :prop="item.key"
                                        :label="item.title"
                                        :rules="item.rules"
                                >
                                    <el-select
                                            :disabled="item.readOnly"
                                            v-model="dataMsg[item.key]"
                                            filterable
                                            remote
                                            :clearable="item.readOnly===true?false:true"
                                            @change="item.remoteMethodChange"
                                            reserve-keyword
                                            placeholder="请输入关键词"
                                            :remote-method="item.remoteMethod"
                                            :loading="getParent['loading']">
                                        <el-option
                                                v-for="item in getParent[item.remoteList]"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value">
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                            </template>
                            <template v-else>
                                <el-form-item
                                        :prop="item.key"
                                        :label="item.title"
                                        :rules="item.rules"
                                >
                                    <el-input
                                            :disabled="item.readOnly"
                                            :clearable="item.readOnly===true?false:true"
                                            v-model="dataMsg[item.key]"
                                            placeholder="请输入内容"
                                    ></el-input>
                                </el-form-item>
                            </template>
                        </div>
                    </template>
                </el-form>
            </slot>
            <span slot="footer" class="dialog-footer">
        <el-button @click="show = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit('editLayer')">提 交</el-button>
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
                bntShow: true,
                title: ''
            }
        },
        props: {
            editClass: {
                type: String,
                default: 'hxLayer'
            },
            // api接口
            editFn: Function,
            options: Object
        },
        beforeMount() {
        },
        mounted: function () {
            this.$forceUpdate()
            try {
                let arrFn = this.editFn()
                this.$common.bindFn(this, arrFn)
            } catch (e) {
            }
            this.title = this.getState.edit_Window_Data.Name || this.options.title
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
            'getState.edit_Window_Visible': {
                handler: function (val, oldVal) {
                    this.show = val
                    if (val === true) {
                        /**
                         * 编辑对象，从this.getState.table 筛选出必须的传给后台，过滤调其他方法新加的一些属性
                         * @type {{}}
                         */
                        let o = {}
                        for (let attr in this.getState.edit_Window_Data) {
                            for (let item of this.getState.table) {
                                if (item.key) {
                                    if (item.key === attr) {
                                        o[item.key] = this.getState.edit_Window_Data[item.key]
                                    }
                                }
                            }
                        }
                        this.dataMsg = Object.assign({}, o)
                        this.setInitRemoteMethod()
                    } else {
                        this.dataMsg = {}
                    }
                },
                deep: false
            }
        },
        methods: {
            setNumber(val) {
                this.dataMsg[val] = Number(this.dataMsg[val])
            },
            setInitRemoteMethod() {
                let _this = this
                this.getState.table.forEach(function (item) {
                    if (item.type === 'remoteMethod') {
                        let obj = {}
                        obj.value = _this.getState.edit_Window_Data[item.key]
                        _this.getState.tableData.forEach(function (filterItem) {
                            if (filterItem.Id === _this.dataMsg.Id) {
                                obj.label = filterItem[item.key]
                            }
                        })
                        _this.$parent[item.remoteList] = [obj]
                    }
                })
            },
            setVisible() {
                this.$store.dispatch(this.options.gridKey + '_edit_Window_Visible')
                this.handleReset('editLayer')
            },
            handleSubmit(formName) {
                let _this = this
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        for (let item in _this.dataMsg) {
                            _this.dataMsg[item] = this.$common.trim(_this.dataMsg[item])
                        }  // 去除空格
                        let url = `${this.getState.editUrl}(${_this.dataMsg.Id})`
                        let requestDataHeader = Vue.prototype.$api.request(url, {
                            method: 'PATCH',
                            body: JSON.stringify(_this.dataMsg)
                        })
                        let isRequestOk
                        fetch(requestDataHeader).then(resp => {
                            if (resp.ok === true) {
                                _this.$message({
                                    showClose: true,
                                    message: '修改成功',
                                    type: 'success'
                                })
                                _this.$store.dispatch(_this.options.gridKey + '_set_refresh')
                                _this.show = false // 关闭弹窗
                            } else {
                                isRequestOk = resp.ok
                                return resp.json()
                            }
                        }).then(data => {
                            if (isRequestOk === false) {
                                _this.$notify.error({
                                    title: '错误消息',
                                    message: data.message
                                })
                                return false
                            }
                        })
                    } else {
                        console.log('error submit!!')
                        return false;
                    }
                })
            },
            handleReset(name) {
                this.$refs[name].resetFields()
            }
        }
    }
</script>
<style scoped>

</style>
