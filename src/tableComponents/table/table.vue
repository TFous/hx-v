<template>
    <div>
        <div class="otable">
            <slot>
                <el-table
                        :data="getTableData"
                        :border="getState.border"
                        :stripe="true"
                        ref="xtable"
                        :row-class-name="tableRowClassName"
                        @cell-dblclick="showDetails"
                        @selection-change="selectCheckbox"
                        @filter-change="filterChangeFn"
                        @sort-change="sortChangeFn"
                        @header-dragend="headerDragendFn"
                        style="width: 100%">
                    <el-table-column
                            v-if="getState.isSelection"
                            type="selection"
                            fixed="left"
                            width="40">
                    </el-table-column>
                    <slot name="expand"></slot>
                    <template v-for="(item, index) in getState.table" v-if="item.column==='show'">
                        <template v-if="!item.render">
                            <template v-if="item.filter === true">
                                <el-table-column
                                        show-overflow-tooltip
                                        :fixed="item.fixed"
                                        :prop="item.key"
                                        :column-key="item.key"
                                        :label="item.title"
                                        :sortable="item.sortable"
                                        :filters="item.filters"
                                        filter-placement="bottom-start"
                                        :width="item.width">
                                </el-table-column>
                            </template>
                            <template v-else>
                                <el-table-column
                                        show-overflow-tooltip
                                        :fixed="item.fixed"
                                        :prop="item.key"
                                        :column-key="item.key"
                                        :label="item.title"
                                        :sortable="item.sortable"
                                        :width="item.width">
                                </el-table-column>
                            </template>
                        </template>
                        <template v-else-if="item.render">
                            <el-table-column
                                    class="render-wrap"
                                    show-overflow-tooltip
                                    :fixed="item.fixed"
                                    :label="item.title"
                                    :width="item.width">
                                <template slot-scope="scope">
                                    <template v-for="(renderItem,index) in item.render"
                                              v-if="item.displayType ===1">
                                        <template v-if="scope.row.btnShow && JSON.parse(scope.row.btnShow)[item.key] ?JSON.parse(scope.row.btnShow)[item.key].indexOf(index)>-1:true">
                                            <el-button
                                                    class="render-toggle"
                                                    v-if="renderItem.tag==='button'"
                                                    @click.native.prevent="renderItem.fn(scope)"
                                                    :type="renderItem.type"
                                                    plain>
                                                <!--{{renderItem.show}}-->
                                                {{renderItem.text}}
                                            </el-button>
                                            <a
                                                    v-else-if="renderItem.tag==='a'"
                                                    :href="renderItem.href"
                                            >{{getKey(scope, item.key)}}</a>
                                            <template v-else>
                                        <span :title="renderItem.title"
                                              :class="renderItem.class?renderItem.class:'cell-cursor'"
                                              @click="renderItem.fn(scope)">{{getKey(scope, item.key)}}</span>
                                            </template>
                                        </template>
                                    </template>

                                    <template v-if="item.displayType ===2">
                                        <el-popover
                                                placement="left"
                                                trigger="hover">
                                            <ul class="table-btn-ul">
                                                <li
                                                        v-for="(renderItem,index1) in item.render"
                                                        v-if="scope.row.btnShow && JSON.parse(scope.row.btnShow)[item.key] ?JSON.parse(scope.row.btnShow)[item.key].indexOf(index1)>-1:true"
                                                        @click="renderItem.fn(scope)"
                                                >{{renderItem.text}}</li>
                                            </ul>
                                            <svg-icon slot="reference" icon-class="more" class="icon icon-org"/>
                                        </el-popover>
                                    </template>
                                </template>
                            </el-table-column>
                        </template>
                    </template>
                </el-table>
            </slot>
        </div>
        <column-layer
                :options='options'
        ></column-layer>
    </div>
</template>
<script>
    import Vue from 'vue'
    let isFirst = true
    // import * as common from '../common'
    import clone from 'clone'
    import columnLayer from '../columnSetting'
    export default {
        name: 'xtable',
        data() {
            return {
                isRefresh: false, // 用于 表格自动补充列 需要影藏的按钮
                tableIndex: null, // 用于 表格自动补充列 需要影藏的按钮
                loading: false, // 表格是否加载OK
                tableData: [], // 表格数据
                urlsKey: [],  // 数据字典名称
                urlsValues: []  // 数据字典url
            }
        },
        components: {
            'column-layer':columnLayer,
        },
        props: {
            // api接口
            tableHeight: {
                type: String,
                default: 'auto',
            },
            isUnregisterModule: {
                type: Boolean,
                default: true,
            },
            tableFn: Function,
            options: Object
        },
        beforeMount() {
            this.$xvuex.registerModule(this, this.options, this.options.gridKey)
        },
        mounted() {
            try {
                let arrFn = this.tableFn()
                this.$common.bindFn(this, arrFn)
            } catch (e) {
            }
            this.loadingFn()
            // this.setFilters()
        },
        destroyed() {
            if (this.isUnregisterModule === true) {
                try {
                    this.$store.unregisterModule(this.options.gridKey)
                } catch (e) {
                }
            }
            isFirst = true
        },
        watch: {
            /**
             * 监听requestUrl,获取table data,
             * 统一获取table data 的途径
             */
            'getState.requestUrl': {
                handler: function (val, oldVal) {
                    if (oldVal !== val) {
                        this.getList()
                    }
                },
                deep: true
            },
            /**
             *  获取tableData 后处完相关数据塞进tableData，
             *  前台展示结果
             */
//      'getState.tableData': {
//        handler: function (val, oldVal) {
//          if (oldVal !== undefined) {
//              this.$refs.xtable.toggleRowSelection([val[0]]);
//          }
//        },
//        deep: true
//      },
            /**
             *  搜索筛选排序
             */
            'getState.searchBtn': {
                handler: function (val, oldVal) {
                    if (oldVal !== val) {
                        this.searchFn()
                    }
                    let isResetCurrentPage = this.getState.isResetCurrentPage
                    if (isResetCurrentPage === true) {
                        this.$store.dispatch(this.options.gridKey + 'setData', {pager_CurrentPage: 1})
                        this.$store.dispatch(this.options.gridKey + 'setData', {isRun: false})
                        // 执行后重置
                        this.$store.dispatch(this.getState.gridKey + 'setData', {isResetCurrentPage: false})
                    }
                },
                deep: true
            },
            /**
             *   刷新按钮
             */
            'getState.refresh': {
                handler: function (val, oldVal) {
                    if (oldVal !== val && oldVal !== undefined) {
                        this.refreshFn()
                    }
                },
                deep: true
            },
            /**
             *  每页展示数量变化
             */
            'getState.pager_Size': {
                handler: function (val, oldVal) {
                    if (oldVal !== undefined && oldVal !== val) {
                        this.$store.dispatch(this.options.gridKey + 'setData', {pager_CurrentPage: 1})
                        this.getList(val)
                    }
                },
                deep: true
            },
            /**
             *  页数变化
             */
            'getState.pager_CurrentPage': {
                handler: function (val, oldVal) {
                    this.$store.dispatch(this.options.gridKey + 'setData', {pager_CurrentPage: val})
                    if (oldVal !== undefined && oldVal !== val) {
                        let isRun = this.getState.isRun
                        if(isRun === true){
                            this.getList()
                        }else {
                            // 每次都必须回位
                            this.$store.dispatch(this.options.gridKey + 'setData', {isRun: true})
                        }
                    }
                },
                deep: true
            },
            'getState.toggleRowExpansion': {
                handler: function (val, oldVal) {
                    if (oldVal !== undefined && oldVal !== val) {
                        let rows = this.getState.tableData
                        this.toggleRowExpansion(rows, val)
                    }
                },
                deep: true
            }
        },
        computed: {
            getState() {
                return this.$store.state[this.options.gridKey]
            },
            getTableData() {
                let data = clone(this.$store.state[this.options.gridKey].tableData)
                let dataLength = data.length
                // 最小显示条数，撑开高度
                let length = 12
                let value = length -dataLength
                this.tableIndex = dataLength - 1
                if(dataLength === 0){
                    return []
                }
                if(value > 0) {
                    for (let i = 0; i < value; i++) {
                        data.push({show:true})
                    }
                }
                return data
            }
        },
        updated() {

        },
        methods: {
            tableRowClassName({row, rowIndex}) {
                if (rowIndex> this.tableIndex) {
                    return 'hide-row';
                }
                return '';
            },
            getKey(scope, key) {
                let splitKey = key.split('.')
                let text = scope.row
                if (splitKey.length === 1) {
                    text = text[key]
                } else {
                    splitKey.forEach(function (item, index) {
                        text = text[item]
                    })
                }
                return text
            },
            // 展开
            toggleRowExpansion(rows, boolean) {
                if (rows) {
                    rows.forEach(row => {
                        this.$refs.xtable.toggleRowExpansion(row, boolean)
                    })
                }
            },
            // 显示详情
            showDetails(rowData) {
                this.$store.dispatch(this.options.gridKey + '_details_Window_Visible', rowData)
            },
            selectCheckbox(selection) {
                let select = clone(selection)
                let data = []
                // 当对象有Id 属性时才添加到批量删除对象里
                select.forEach(item=>{
                    if(item.Id){
                        data.push(item)
                    }
                })
                this.$store.dispatch(this.options.gridKey + 'setData', {selection: data})
            },
            filterChangeFn(filters) {
                let keys = Object.keys(filters)
                let _this = this
                let searchBtn = _this.getState.searchBtn
                this.getState.table.forEach(function (item) {
                    if (keys[0] === item.key) {
                        if (item.isExpand === true) {
                            let key = Object.keys(filters)[0]
                            let newFilters = {}
                            newFilters[key.replace('.', '_')] = filters[key]
                            _this.$store.dispatch(_this.options.gridKey + '_set_efilterbox', newFilters)
                            _this.$store.dispatch(_this.options.gridKey + 'setData', {searchBtn: !searchBtn})
                        } else {
                            _this.$store.dispatch(_this.options.gridKey + '_set_filterbox', filters)
                            _this.$store.dispatch(_this.options.gridKey + 'setData', {searchBtn: !searchBtn})
                        }
                    }
                })
            },
            /**
             *  基本思路：创建一个urlObj,每个属性是一个关键词的集合，条件关键词无非就是filter/order等，
             *  存放之前先判断对象中是否有这个关键词，如果没有直接塞进去，有则在已存在那里继续拼接
             *  定义 filterUrl，sortUrl，expandUrl
             */
            searchFn() {
                let _this = this
                let url = this.getState.url
                let urlObj = {}
                /**
                 *  $expand 扩展
                 *  目前只支持初加载 vuex => options => urlParameter  => $expand
                 *
                 */
                let initExpand = _this.getState.urlParameter.$expand
                let expandUrl
                if (initExpand !== '' && initExpand !== undefined) {
                    expandUrl = initExpand
                    urlObj['expandUrl'] = `$expand=${initExpand}`
                } else {
                    expandUrl = ''
                }

//                let expandUrl = initExpand !== '' ? initExpand : ''
//                if (expandUrl !== '') {
//                    urlObj['expandUrl'] = `$expand=${expandUrl}`
//                }
                /**
                 *  条件筛选
                 *
                 */
                    // 正常筛选
                let filterUrl = ``
                let filtersBOx = _this.getState.filterBox
                if (Object.keys(filtersBOx).length !== 0) {
                    for (let filters in filtersBOx) {
                        let filtersHtmls = ``
                        filtersBOx[filters].forEach(function (key) {
                            filtersHtmls += `${key}or`
                        })
                        filterUrl += `(${filtersHtmls.slice(0, -2)})and`
                    }
                }

                // expand 筛选，目前只支持展开一个，并进行筛选
                if (expandUrl !== '') {
                    let expandFilterUrl = ``
                    let expandFiltersBOx = _this.getState.efilterBox
                    if (Object.keys(expandFiltersBOx).length !== 0) {
                        for (let filters in expandFiltersBOx) {
                            let filtersHtmls = ``
                            expandFiltersBOx[filters].forEach(function (key) {
                                let splitKey = key.split(' ')
                                let splitKey01 = splitKey[0].split('.')
                                let key1
                                if (splitKey01.length === 1) {
                                    key1 = splitKey[0]
                                } else if (splitKey01.length === 2) {
                                    key1 = splitKey[1]
                                } else {
                                    console.error('splitKey设置有错误')
                                    console.error(splitKey)
                                }
                                let newKey = `(s/${key1.split('(')[1]} ${splitKey[1]} ${splitKey[2]}`
                                filtersHtmls += `${newKey}or`
                            })
                            expandFilterUrl += `(${filtersHtmls.slice(0, -2)})and`
                        }
                        filterUrl += ` ${expandUrl}/any(s:${expandFilterUrl.slice(0, -3)})and`
                    }
                }

//                let initExpand = _this.getState.urlParameter.$expand
//                let expandUrl
//                if (initExpand !== '' && initExpand !== undefined) {
//                    expandUrl = initExpand
//                } else {
//                    expandUrl = ''
//                }
//                    if (expandFilterUrl !== '') {
//                        urlObj['filterUrl'] = `$filter=${expandUrl}/any(s:${expandFilterUrl.slice(0, -3)})`
//                    }

                let initFilter = _this.getState.urlParameter.$filter
                if (filterUrl !== '') {
                    if (initFilter !== '') {
                        let url = `$filter=(${initFilter} and ${filterUrl.slice(0, -3)})`
                        urlObj['filterUrl'] = _this.isHasKey(urlObj['filterUrl'], url, '$filter=')
                    } else {
                        let url = `$filter=(${filterUrl.slice(0, -3)})`
                        urlObj['filterUrl'] = _this.isHasKey(urlObj['filterUrl'], url, '$filter=')
                    }
                } else {
                    if (initFilter !== '') {
                        let url = `$filter=(${initFilter})`
                        urlObj['filterUrl'] = _this.isHasKey(urlObj['filterUrl'], url, '$filter=')
                    }
                }
                /**
                 *  关键词搜索
                 *
                 */
                let isSeniorSearch = _this.getState.isSeniorSearch
                if (isSeniorSearch === false) {
                    _this.keyWordSearch(urlObj)
                } else {
                    _this.seniorSearchFn(urlObj)
                }
                /**
                 *  排序条件
                 *  目前只支持单列排序
                 *  多列功能后面组建支持，功能上基本没问题
                 *
                 *  如果执行排序，则用排序，不然用初始排序
                 */
                let sortUrl = ``
                let sortBox = _this.getState.sortBox
                if (Object.keys(sortBox).length !== 0) {
                    sortUrl = `$orderby=${sortBox.prop} ${sortBox.order}`
                }
                let initSort = _this.getState.urlParameter.$orderby
                if (sortUrl !== '') {
                    urlObj['sortUrl'] = sortUrl
                } else if (initSort !== '' && initSort !== undefined) {
                    urlObj['sortUrl'] = `$orderby=${initSort}`
                }
                /**
                 *  url 拼接
                 */
                let urlValues = Object.values(urlObj)
                urlValues.forEach(function (item, index) {
                    if (index === 0) {
                        url += `?${item}`
                    } else {
                        url += `&${item}`
                    }
                })
                let hashCode = this.$common.gethashcode()
                url = `${url}&?r=${hashCode}`
                _this.$store.dispatch(_this.options.gridKey + 'setData', {requestUrl: url})
            },
//     高级搜索
            seniorSearchFn(urlObj) {
                let _this = this
                let seniorObj = _this.getState.seniorSearchBox
                let otherSeniorSearchOpt = _this.getState.otherSeniorSearchOpt
                let seniorSearchType = this.getState.seniorSearchType
                let typeKey, sliceLength
                if (seniorSearchType === false) {
                    typeKey = 'or'
                    sliceLength = -2
                } else {
                    typeKey = 'and'
                    sliceLength = -3
                }
                let valUrl = ``
                for (let item in seniorObj) {
                    if (typeof seniorObj[item] === 'number') {
                        valUrl += `(${item} eq ${Number(seniorObj[item])})${typeKey}`
                    } else if (typeof seniorObj[item] === 'string') {
                        valUrl += `(contains(${item},'${seniorObj[item]}'))${typeKey}`
                    } else if (seniorObj[item] instanceof Array === true) {

                        let startTime = this.$common.setStarTime(seniorObj[item][0])
                        let endTime = this.$common.endTime(seniorObj[item][1])

                        valUrl += `(${item} ge ${startTime} and ${item} le ${endTime})${typeKey}`
                    }
                }
//        手动添加的搜索条件
                for (let item in otherSeniorSearchOpt) {
                    if (otherSeniorSearchOpt[item] instanceof Array === true) {
                        let length = otherSeniorSearchOpt[item].length
                        let i = 0
                        for (; i < length; i++) {
                            // 最后一个是and
                            if (i === (length - 1)) {
                                if (typeof otherSeniorSearchOpt[item][i] === 'number') {
                                    valUrl += `(${item} eq ${otherSeniorSearchOpt[item][i]})${typeKey}`
                                } else if (typeof otherSeniorSearchOpt[item][i] === 'string') {
                                    valUrl += `(${item} eq '${otherSeniorSearchOpt[item][i]}')${typeKey}`
                                }
                            } else {
                                if (typeof otherSeniorSearchOpt[item][i] === 'number') {
                                    valUrl += `(${item} eq ${otherSeniorSearchOpt[item][i]})or`
                                } else if (typeof otherSeniorSearchOpt[item][i] === 'string') {
                                    valUrl += `(${item} eq '${otherSeniorSearchOpt[item][i]}')or`
                                }
                            }
                        }
                    } else {
                        if (typeof otherSeniorSearchOpt[item] === 'number') {
                            valUrl += `(${item} eq ${otherSeniorSearchOpt[item]})${typeKey}`
                        } else if (typeof otherSeniorSearchOpt[item][i] === 'string') {
                            valUrl += `(${item} eq '${otherSeniorSearchOpt[item]}')${typeKey}`
                        }
                    }
                }
                if (valUrl !== '') {
                    let url = `$filter=(${valUrl.slice(0, sliceLength)})`
                    urlObj['filterUrl'] = _this.isHasKey(urlObj['filterUrl'], url, '$filter=')
                }
            },
//      关键词搜索
            keyWordSearch(urlObj) {
                let _this = this
                let searchKey = _this.getState.searchKeys
                let searchVal = _this.getState.searchVal
                if (searchVal !== '') {  // 如果搜索有值
                    let valUrl = ``
                    if (searchKey === 'searchAll') {
                        for (let item of _this.getState.table) {
                            if ((item.type === '' || item.type === 'textarea' || item.type === 'string') && item.searchKey !== 'hide') {
                                valUrl += `(contains(${item.key},'${searchVal}'))or`
                            } else if (item.type === 'number' && Number.isNaN(Number(searchVal)) !== true) {
                                valUrl += `(${item.key} eq ${Number(searchVal)})or`
                            }
                        }
                    } else {
                        for (let item of _this.getState.table) {
                            if (item.key === searchKey) {
                                if (item.type === '' || item.type === 'textarea' || item.type === 'string') {
                                    valUrl += `(contains(${item.key},'${searchVal}'))or`
                                } else if (item.type === 'number') {
                                    if (Number.isNaN(Number(searchVal)) !== true) {
                                        valUrl += `(${item.key} eq ${Number(searchVal)})or`
                                    } else {
                                        _this.$message({
                                            showClose: true,
                                            message: '参数必须为数字',
                                            type: 'warning'
                                        })
                                        return false
                                    }
                                }
                            }
                        }
                    }
                    if (valUrl !== '') {
                        let url = `$filter=(${valUrl.slice(0, -2)})`
                        urlObj['filterUrl'] = _this.isHasKey(urlObj['filterUrl'], url, '$filter=')
                    }
                }
            },
            /**
             * 字符串中中是否含有置顶字段
             * @param oldString 需要检测的string
             * @param newString 需要新加的sting
             * @param key
             */
            isHasKey(oldString, newString, key) {
                let string
                if (oldString === undefined) {
                    string = newString
                } else {
                    string = `${oldString} and ${newString.split(key)[1]}`
                }
                return string
            },
            headerDragendFn (newWidth, oldWidth, column, event) {
                /**
                 * 每个表格自己特有的gridKey 作为存储表格宽度
                 *  {gridKey:[{name:名称;width:123;}]}
                 *
                 **/
                let saveKey = this.options.gridKey
                let saveObj = JSON.parse(localStorage.getItem('TABLES_WIDTH')) || {}
                let isHas = false
                if(saveObj[saveKey] === undefined ){
                    saveObj[saveKey] = []
                    let columnObj= {}
                    columnObj.name = column.label
                    columnObj.width = newWidth
                    saveObj[saveKey].push(columnObj)
                }else {
                    saveObj[saveKey].forEach(function (value) {
                        if(value.name === column.label){
                            value.width = newWidth
                            isHas = true
                        }
                    })
                    if(isHas === false){
                        let columnObj= {}
                        columnObj.name = column.label
                        columnObj.width = newWidth
                        saveObj[saveKey].push(columnObj)
                    }
                }
                localStorage.setItem('TABLES_WIDTH',JSON.stringify(saveObj))
            },
            sortChangeFn(column, prop, order) {
                let orderKey = column.order === 'descending' ? 'desc' : 'asc'
                let orderObj = {
                    order: orderKey,
                    prop: column.prop
                }
                this.$store.dispatch(this.options.gridKey + '_set_sortbox', orderObj)
                let searchBtn = this.getState.searchBtn
                this.$store.dispatch(this.options.gridKey + 'setData', {searchBtn: !searchBtn})
            },
//     初始化url,获取数据字典数据
            loadingFn() {
                this.getDicMsg()
                let url = this.getState.url
                let urlParameter = this.getState.urlParameter
                let isFirst = false
                for (let item in urlParameter) {
                    if (urlParameter[item] !== '') {
                        if (isFirst === false) {
                            isFirst = true
                            url += `?${item}=${urlParameter[item]}`
                        } else {
                            url += `&${item}=${urlParameter[item]}`
                        }
                    }
                }
                this.$store.dispatch(this.options.gridKey + 'setData', {requestUrl: url})
            },
            //        获取表格和数据字典数据
            getList(size) {
                let _this = this
                let regexp = /&\?r=[0-9]{4}/i
                let $requestUrl = this.getState.requestUrl.replace(regexp, '');
                // 如果初始化url 为空，则不继续往下走
                if ($requestUrl === '') {
                    console.log('初始化url为空')
                    return false
                }
                let $countUrl
                let dataVal = _this.getState.getData_val
                let splitUrl = $requestUrl.split('?$')
                // page
                let pageSize, pageSkip
                if (size) {
                    pageSize = size
                    pageSkip = 0
                } else {
                    let pagerCurrentPage = _this.getState.pager_CurrentPage
                    pageSize = _this.getState.pager_Size
                    pageSkip = _this.getState.pager_Size * (pagerCurrentPage - 1)
                }
                /**
                 *  下面是本地分页
                 *
                 */
                let isRequestOk

                if (_this.getState.isLocalPages === true) {
                    let requestDataHeader = Vue.prototype.$api.request($requestUrl)
                    if (_this.getState.localTableData.length !== 0) {
                        let pagerCurrentPage = _this.getState.pager_CurrentPage
                        pageSize = _this.getState.pager_Size
                        pageSkip = _this.getState.pager_Size * (pagerCurrentPage - 1)
                        let tableData = _this.getState.localTableData.slice(pageSkip, pageSkip + pageSize)
                        _this.$store.dispatch(_this.options.gridKey + 'setData', {initTableData: tableData})
                        return false
                    }
                    fetch(requestDataHeader).then(resp => {
                        isRequestOk = resp.ok
                        return resp.json()
                    }).then(data => {
                        if (isRequestOk === false) {
                            _this.$notify.error({
                                title: '错误消息',
                                message: data.message
                            })
                            return false
                        }
                        let count = data[dataVal].length;
                        _this.$store.dispatch(_this.options.gridKey + 'setData', {pager_Total: count})
                        _this.$store.dispatch(_this.options.gridKey + 'setData', {localTableData: data[dataVal]})
                        let tableData = _this.getState.localTableData.slice(pageSkip, pageSize)
                        _this.$store.dispatch(_this.options.gridKey + 'setData', {initTableData: tableData})
                        _this.$store.dispatch(_this.options.gridKey + 'setData', {isRun: true})
                    })
                    return false
                }

                /**
                 *  下面是服务器分页
                 *
                 */
                if (splitUrl.length === 1) {
                    $countUrl = `${splitUrl[0]}/$count`
                    $requestUrl += `?$top=${pageSize}&$skip=${pageSkip}`
                } else if (splitUrl.length === 2) {
                    $countUrl = `${splitUrl[0]}/$count?$${splitUrl[1]}`
                    $requestUrl += `&$top=${pageSize}&$skip=${pageSkip}`
                } else if (splitUrl.length > 2) {
                    console.error('获取总条数count URL失败！')
                }
                /**
                 *  requestCountHeader 获取总条数，不含分页信息
                 *
                 */
                let requestCountHeader = Vue.prototype.$api.request($countUrl)
                fetch(requestCountHeader).then(resp => {
                    isRequestOk = resp.ok
                    if (isRequestOk === false) {
                        return resp.json()
                    } else {
                        return resp.text()  // 没有问题
                    }
                }).then(count => {
                    let length = count
                    if (isRequestOk === false) {
                        _this.$notify.error({
                            title: '错误消息',
                            message: data.message
                        })
                        return false
                    }
                    if(typeof JSON.parse(count) == 'object'){
                        length = JSON.parse(count)[dataVal]
                    }
                    if (Number(length) === 0) {
                        _this.ready = true
                        _this.$store.dispatch(_this.options.gridKey + 'setData', {tableData: []})
                        _this.$store.dispatch(_this.options.gridKey + 'setData', {pager_Total: 0})
                        _this.$store.dispatch(_this.options.gridKey + 'setData', {pager_CurrentPage: 1})
                        _this.$message('无符合要求数据')
                        return false
                    }
                    /**
                     *  当获取总条数不位0的时候，在拉取数据
                     */
                    _this.$store.dispatch(_this.options.gridKey + 'setData', {pager_Total: Number(length)})

                    // requestDataHeader 获取分页 的data
                    let requestDataHeader = Vue.prototype.$api.request($requestUrl)
                    fetch(requestDataHeader).then(resp => {
                        isRequestOk = resp.ok
                        return resp.json()
                    }).then(data => {
                        if (isRequestOk === false) {
                            _this.$notify.error({
                                title: '错误消息',
                                message: data.message
                            })
                            return false
                        }
                        _this.$store.dispatch(_this.options.gridKey + 'setData', {isRun: true})
                        _this.$store.dispatch(_this.options.gridKey + 'setData', {initTableData: data[dataVal]})
                    })
                })
            },
//      注册模块
            registerModule(initState, gridKey) {
                if (!this.$store) {
                    console.error('未找到vuex store实例')
                    return
                }
                // 为data-grid创建一个动态模块，并将其注册到vuex store中
                if (!gridKey) {
                    console.error('props参数gridKey必须传入')
                    return
                }
                // 模块已存在则返回
                if (this.$store.state[gridKey]) {
                    return
                }

                this.$store.registerModule(gridKey, {
                    state: initState
                })
            },
//      获取数据字典信息
            getDicMsg() {
                let urls = this.getState.dicUrls
                let urlsKey = Object.keys(urls)
                let urlsValues = Object.values(urls)
                this.urlsKey = urlsKey
                this.urlsValues = urlsValues

                let _this = this
                let myRequests = []
//        避免数据字典重复请求
                urlsKey.forEach(function (key, index) {
                    // 模块已存在则返回
                    if (_this.$store.state[key]) {
                        return
                    }
                    myRequests.push(Vue.prototype.$api.request(urlsValues[index]))
                })
                Promise.all(myRequests.map(myRequest =>
                    fetch(myRequest).then(resp => {
                        if (resp.ok === false) {
                            _this.$notify.error({
                                title: '错误消息',
                                message: `获取莫项数据字典发生错误`
                            })
                        }
                        return resp.json()
                    })
                )).then(datas => {
                    datas.forEach(function (data, index) {
//              注册数据字典
                        let gridKey = _this.urlsKey[index]
                        let initState = {
                            data: data
                        }
                        _this.registerModule(initState, gridKey)
                    })
                })
            },
//    刷新
            refreshFn() {
                this.reset()
                // this.getList()
            },
            reset() {
                this.$refs.xtable.clearFilter()
//                this.$store.dispatch(this.options.gridKey + 'setData', {isSeniorSearch: false})  // 恢复高级搜索
                this.$store.dispatch(this.getState.gridKey + 'setData', {selection: []})
                this.$store.dispatch(this.getState.gridKey + 'setData', {searchVal: ''})
                this.$store.dispatch(this.getState.gridKey + 'setData', {filterBox: {}})
                this.$store.dispatch(this.getState.gridKey + 'setData', {efilterBox: {}})
                this.$store.dispatch(this.getState.gridKey + 'setData', {seniorSearchBox: {}})
                this.$store.dispatch(this.getState.gridKey + 'setData', {sortBox: {}})
                this.$store.dispatch(this.options.gridKey + 'setData', {searchBtn: !this.getState.searchBtn})
                this.$store.dispatch(this.getState.gridKey + 'setData', {isRun: true})
            },

        },
        /**
         *  设置筛选项内容
         */
        setFilters() {
            let _this = this
            let table = clone(this.getState.table)
            table.forEach(function (item) {
                if (item.filter === true && item.filterItem) {
                    let filters = []
                    let selects = []
                    let dicData = _this.$api.getItem(item.filterItem)
                    if(dicData.length>0){
                        dicData[0].DataDictionary.forEach(function (dicItem) {
                            //筛选
                            let filterItem = {}
                            filterItem.text = dicItem.Name
                            filterItem.value = `(${item.key} eq ${dicItem.Id})`
                            filters.push(filterItem)
                            //修改新增
                            let selectItem = {}
                            selectItem.text = dicItem.Name
                            selectItem.value = dicItem.Id
                            selects.push(selectItem)
                        })
                        item['filters'] = filters
                        item['selects'] = selects
                        _this.remoteListAll[item.key] = filters
                    }
                }
            })
            _this.$store.dispatch(_this.options.gridKey + 'setData', {table: table})
        },
        filters: {}
    }
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

</style>
