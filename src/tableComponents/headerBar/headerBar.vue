<template>
    <div>
        <div class="pagerHead">
            <el-row :gutter="20">
                <el-col :span="12" align="right" style="float: right;">
                    <slot></slot>
                    <template v-if="refreshShow">
                        <slot name="refreshBtn">
                            <el-tooltip effect="dark" content="刷新页面，显示全部结果" placement="top-end">
                                <el-button plain type="" @click="refreshFn">
                                    <i class="iconfont icon-refresh"></i>
                                </el-button>
                            </el-tooltip>
                        </slot>
                    </template>
                    <slot name="refreshAfter"></slot>
                    <template v-if="addShow">
                        <slot name="addBtn">
                            <el-tooltip content="新增" placement="top-end">
                                <el-button plain type="primary" @click="setAddVisible">
                                    <i class="iconfont icon-add"></i>
                                </el-button>
                            </el-tooltip>
                        </slot>
                    </template>
                    <slot name="addAfter"></slot>
                    <template v-if="delShow">
                        <slot name="batchBtn">
                            <el-tooltip content="批量删除" placement="top-end">
                                <el-button plain type="danger" @click="batchDel">
                                    <i class="iconfont icon-delete"></i>
                                </el-button>
                            </el-tooltip>
                        </slot>
                    </template>
                    <slot name="delAfter"></slot>
                    <template v-if="settingShow">
                        <slot name="batchBtn">
                            <el-tooltip content="表格设置" placement="top-end">
                                <el-button plain type="info" @click="setting">
                                    <i class="iconfont icon-set"></i>
                                </el-button>
                            </el-tooltip>
                        </slot>
                    </template>
                    <slot name="setAfter"></slot>
                    <!--<el-dropdown :hide-on-click="false">-->
                    <!--<el-button plain type="info">-->
                    <!--<i class="iconfont icon-set"></i>-->
                    <!--</el-button>-->
                    <!--<el-dropdown-menu slot="dropdown" class="hx-drapMenu">-->
                    <!--<el-checkbox-group v-model="checkList">-->
                    <!--<template v-for="item in dropList">-->
                    <!--<el-dropdown-item>-->
                    <!--<el-checkbox :label="item"></el-checkbox>-->
                    <!--</el-dropdown-item>-->
                    <!--</template>-->
                    <!--</el-checkbox-group>-->
                    <!--<el-dropdown-item divided>-->
                    <!--<el-button type="primary" @click="column">确定</el-button>-->
                    <!--</el-dropdown-item>-->
                    <!--</el-dropdown-menu>-->
                    <!--</el-dropdown>-->
                </el-col>
                <el-col :span="12">
                    <slot name="search"></slot>
                    <div class="searchWrap" v-show="isShowSearch">
                        <el-input :clearable="true" placeholder="请输入内容" :disabled="isSeniorSearch"
                                  @keyup.enter.native="searchFn"
                                  v-model="paramsValue"
                                  class="input-with-select">
                            <el-select v-model="paramsSelect"
                                       :disabled="isSeniorSearch"
                                       slot="prepend" placeholder="请选择" style="width:130px;">
                                <el-option v-for="(item, key) in paramsOption"
                                           :key="item.value"
                                           :label="item.label"
                                           :value="item.value"></el-option>
                            </el-select>
                            <el-button :disabled="isSeniorSearch" slot="append" @click="searchFn"
                                       icon="el-icon-search"></el-button>
                        </el-input>
                    </div>
                    <div class="seniorSearchBtn" v-show="isShowSenior">
                        <el-switch
                            v-model="isSeniorSearch"
                            @change="switchChangeFn"
                            :active-text="seniorText">
                        </el-switch>
                    </div>
                    <!--<el-button type="primary" icon="el-icon-search">高级</el-button>-->
                </el-col>
            </el-row>
            <!--高级搜索内容-->
            <div class="seniorWrap" v-show="isSeniorSearch">
                <el-row :gutter="20">
                    <el-form ref="form" :model="formItem" label-width="130px">
                        <template v-for="tableItem in optTables">
                            <template v-for="seniorItem in seniorSearchOptions">
                                <el-col :span="6" v-if="tableItem.key===seniorItem.key">
                                    <el-form-item :label="seniorItem.title" v-if="seniorItem.type==='date'">
                                        <el-date-picker
                                            v-model="formItem[seniorItem.key]"
                                            type="daterange"
                                            range-separator="至"
                                            start-placeholder="开始日期"
                                            end-placeholder="结束日期">
                                        </el-date-picker>
                                    </el-form-item>
                                    <el-form-item :label="seniorItem.title" v-else-if="seniorItem.type==='number'">
                                        <el-col :span="24" class=" seniorSearch-num-range">
                                            <el-input class="seniorSearch-num-range-start"
                                                      @change="setNumber(seniorItem.key,'start',seniorItem.title)"
                                                      v-model="formItem[seniorItem.key].start"></el-input>
                                            <span class="seniorSearch-num-icon"> - </span>
                                            <el-input  class="seniorSearch-num-range-end"
                                                       @change="setNumber(seniorItem.key,'end',seniorItem.title)"
                                                       v-model="formItem[seniorItem.key].end"></el-input>
                                        </el-col>
                                    </el-form-item>
                                    <el-form-item :label="seniorItem.title" v-else>
                                        <el-input @change="isEmptyKey(seniorItem.key)"
                                                  @keyup.enter.native="seniorSearchFn"
                                                  v-model="formItem[seniorItem.key]"
                                                  :clearable="true"></el-input>
                                    </el-form-item>
                                </el-col>
                            </template>
                        </template>
                        <slot name="seniorSearch"></slot>
                        <div style="text-align: right;clear: both">
                            <el-button type="success" @click="seniorSearchFn">搜 索</el-button>
                        </div>
                    </el-form>
                </el-row>
            </div>
        </div>
    </div>
</template>
<script>
    import Vue from 'vue'
    import clone from 'clone'
    import * as common from '../common.js'

    export default {
        data() {
            return {
                seniorSearchType: true, // 高级搜索方式
                seniorSearchTip: '列表展示满足任意一个搜索条件的数据', // 高级搜索提示 当seniorSearchType ：false 的文字
                dropList: [],
                checkList: JSON.parse(localStorage.getItem('newColumn')) || [],
                optTables: [],
                advancedSearchBox: {}, // 高级搜索选项
                advancedSearch: false, // 高级搜索是否显示
                isSeniorSearch: false, // 高级搜索是否显示
                seniorSearchOptions: [], // 高级搜索选项
                formItem: {}, // 存储高级搜索的值
                paramsOption: [],
                paramsValue: '',
                paramsSelect: 'searchAll' // 默认搜索
            }
        },
        props: {
            headerFn: Function,
            options: Object,
            isShowSearch: {  // 搜索
                type: [Boolean, String],
                default: true
            },
            isShowSenior: {  // 高级搜索按钮
                type: [Boolean, String],
                default: true
            },
            refreshShow: {  // 刷新按钮
                type: [Boolean, String],
                default: true
            },
            addShow: {  // 添加按钮
                type: [Boolean, String],
                default: true
            },
            settingShow: {  // 添加按钮
                type: [Boolean, String],
                default: true
            },
            delShow: {  // 删除按钮
                type: [Boolean, String],
                default: true
            }
        },
        beforeMount() {
        },
        mounted: function () {
            this.clearValFn()
            this.$xvuex.registerModule(this, this.options, this.options.gridKey)
//      this.checkList = JSON.parse(localStorage.getItem('newColumn')) || []
//      设置 checkList
            let dropList = []
            this.getState.table.forEach(function (item) {
                dropList.push(item.title)
            })
            this.dropList = dropList

            try {
                let arrFn = this.headerFn()
                common.bindFn(this, arrFn)
            } catch (e) {
            }
//      this.$store.dispatch(this.getState.gridKey + 'setData', {searchVal: ''})
            this.paramsOption = this.setOptions(this.options.table)
            // 设置高级搜索键值
            this.setSeniorSearchOptions()
            this.optTables = clone(this.getState.table)
            /**
             *  设置默认搜索
             */
            if (this.options.defaultSearch) {
                this.paramsSelect = this.options.defaultSearch
            }

        },
        computed: {
            getState() {
                return this.$store.state[this.options.gridKey]
            },
            seniorText() {
                let text
                if (this.isSeniorSearch === false) {
                    text = '高级搜索关'
                } else {
                    text = '高级搜索开'
                }
                return text
            }
        },
        watch: {
            'getState.isSeniorSearch': {
                handler: function (val, oldVal) {
                    if (oldVal !== undefined) {
                        this.isSeniorSearch = val
                        if (val === false) {
                            this.clearValFn()
                        }
                    }
                },
                deep: true
            },
            'getState.refresh': {
                handler: function (val, oldVal) {
                    if (oldVal !== undefined && oldVal !== val) {
                        this.clearValFn()
                    }
                },
                deep: true
            }
        },
        methods: {
            setting() {
                this.$store.dispatch(this.options.gridKey + '_set_Window_Visible')
            },
            clearValFn() {
                let _this = this
                this.getState.table.forEach(function (item) {
                    if(item.searchKey!=='hide'&& item.type !== 'select'){
                        if(item.type==='number'){  //初始化 formItem，防止区间段搜索this.formItem.key.start  等报错
                            _this.$set(_this.formItem,[item.key],{
                                start:null,
                                end:null,
                                type:'number'
                            })
                        }else{
                            _this.$set(_this.formItem,[item.key],null)
                        }
                    }
                })
            },
            switchChangeFn(val) {
                this.$store.dispatch(this.options.gridKey + 'setData', {isSeniorSearch: val})
            },
            seniorSearchTypeToggleFn(val) {
                if (val === true) {
                    this.seniorSearchTip = '列表展示满足所有条件的数据'
                } else {
                    this.seniorSearchTip = '列表展示满足任意一个搜索条件的数据'
                }
                this.$store.dispatch(this.options.gridKey + 'setData', {seniorSearchType: val})
            },
            isEmptyKey(key) {
                if (this.formItem[key] === '') {
                    delete this.formItem[key]
                }
            },
            setNumber(key,key2, title) {
                if (this.formItem[key][key2] === '') {
                    // delete this.formItem[key]
                    return
                }
                let val = Number(this.formItem[key][key2])
                let isNumber = !Number.isNaN(val)
                if (isNumber === true) {
                    this.formItem[key][key2] = val
                } else {
                    this.formItem[key][key2] = ''
                    this.$message({
                        showClose: true,
                        message: `${title} -- 必须为填写数字！`,
                        type: 'warning'
                    })
                }
            },
//     高级搜索
            seniorSearchFn() {
                for (let item in this.formItem) {
                    this.formItem[item] = common.trim(this.formItem[item])
                }  // 去除空格
                let seniorSearchBox = clone(this.formItem)
                this.$store.dispatch(this.options.gridKey + 'setData', {seniorSearchBox: seniorSearchBox})
                this.$store.dispatch(this.options.gridKey + 'setData', {searchBtn: !this.getState.searchBtn})
                this.$store.dispatch(this.getState.gridKey + 'setData', {isResetCurrentPage: true})

//                this.$store.dispatch(this.options.gridKey + 'setData', {isSeniorSearch: this.isSeniorSearch})
            },
//      设置高级搜索键值
            setSeniorSearchOptions() {
                let tableOptions = this.getState.table
                let _this = this
                tableOptions.forEach(function (item) {
                    if (item.searchKey !== 'hide' && item.type !== 'select') {
                        _this.seniorSearchOptions.push(item)
                    }
                })
            },
            column() {
                let newColumn = this.checkList
//        let newTable = []
//        let newOpt = clone(_this.getState)
//        newOpt.table.forEach(function (item) {
//          newColumn.forEach(function (column) {
//            if (column === item.title) {
//              newTable.push(item)
//            }
//          })
//        })
//        newOpt.table = newTable
//        localStorage.setItem('newOpt', JSON.stringify(newOpt))
                localStorage.setItem('newColumn', JSON.stringify(newColumn))
//        location.reload()
                // DOM updated
//          _this.$store.dispatch(_this.options.gridKey + '_set_state_data', {table: newTable})
//        this.$store.dispatch(this.options.gridKey + '_set_refresh')
                this.$router.replace(`/app?r=${Math.random()}`)
            },
            refreshFn() {
                this.paramsValue = null
                this.$store.dispatch(this.options.gridKey + '_set_refresh')
            },
            setAddVisible() {
                this.$store.dispatch(this.options.gridKey + '_add_Window_Visible')
            },
            batchDel() { // 批量删除
                let _this = this
                let delObjs = _this.getState.selection
                let $length = delObjs.length
                if ($length === 0) {
                    this.$message({
                        message: '请先选中需要删除的项目。',
                        type: 'warning'
                    })
                    return false
                }
                this.$confirm('此操作将删除选中项, 是否继续?', '批量删除确认', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    let myRequests = []
                    delObjs.forEach(async function (item) {
                        let url = `${_this.getState.delUrl}`
                        let delRequest = {
                            method: 'DELETE',
                            headers: {
                                'Accept': 'application/x-www-form-urlencoded',
                                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
                                "Content-Type": "application/x-www-form-urlencoded",
                                'Authorization': await Vue.prototype.$api.getAuthorization()
                            },
                            mode: 'cors',
                            body: `Id=${item.Id}`
                        }
                        let request = new Request(url, delRequest)
                        myRequests.push(request)
                    })
                    Promise.all(myRequests.map(myRequest =>
                            fetch(myRequest).then(resp => {
                                common.set601(resp.status)
                                if (resp.ok === false) {
                                    _this.$notify.error({
                                        title: '错误消息',
                                        message: `删除某项发生错误。`
                                    })
                                }
//                            return resp.json()
                            })
                    )).then(datas => {
                        _this.$message({
                            showClose: true,
                            message: '删除成功',
                            type: 'success'
                        })
                        _this.$store.dispatch(_this.options.gridKey + '_set_refresh')
                        //            删除最后一页 bug
                        let pagerCurrentPage = _this.getState.pager_CurrentPage
                        let pageSize = _this.getState.pager_Size
                        let pagerTotal = _this.getState.pager_Total
                        if (pagerCurrentPage > 1 && pagerTotal % pageSize === $length) {
                            _this.$store.dispatch(_this.getState.gridKey + 'setData', {pager_CurrentPage: pagerCurrentPage - 1})
                        }
                        _this.$store.dispatch(_this.getState.gridKey + 'setData', {selection: []})
                    })
                })
            },
            searchFn() {
                this.paramsValue = common.trim(this.paramsValue)
                this.$store.dispatch(this.getState.gridKey + 'setData', {searchBtn: !this.getState.searchBtn})
                this.$store.dispatch(this.getState.gridKey + 'setData', {isResetCurrentPage: true})
                this.$store.dispatch(this.getState.gridKey + 'setData', {searchVal: this.paramsValue})
                this.$store.dispatch(this.getState.gridKey + 'setData', {searchKeys: this.paramsSelect})
            },
            /**
             * 设置搜索下拉选项
             * @param data
             * @returns {[null]}
             */
            setOptions(data) {
                let paramsOption = [{
                    label: '全部',
                    value: 'searchAll'
                }]
                for (let item of data) {
                    if (item.searchKey !== 'hide' && item.type !== 'select' && item.type !== 'date') {
                        let o = {}
                        o.label = item.title
                        o.value = item.key
                        paramsOption.push(o)
                    }
                }
                return paramsOption
            }
        }
    }
</script>
<style>
    .pagerHead {
        overflow: hidden;
        padding: 0px 0px 12px 0px;
    }

    .seniorSearchBtn {
        display: inline-block;
    }

    .searchWrap {
        /*padding:20px 0px;*/
        margin-right: 20px;
        display: inline-block;
    }

    .searchWrap .el-input__inner {
        text-align: center;
    }
</style>
