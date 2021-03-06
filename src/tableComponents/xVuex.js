import Vue from 'vue'
import * as common from './common'

function createMutations(state, gridKey) {
    return {
        [gridKey + '_SET_DATA'](state, data) {
            // let keys = Object.keys(data)
            // keys.forEach(key=>{
            //     state[key]=data[key]
            // })
            Object.assign(state, data)
        },
        [gridKey + '_EDIT_WINDOW_DATA'](state, data) {
            state.edit_Window_Data = data
        },
        [gridKey + '_DETAILS_WINDOW_DATA'](state, data) {
            state.details_Window_Data = data
        },
        [gridKey + '_FILTER_BOX_DATA'](state, data) {
            // reset
            if (data === null) {
                state.filterBox = {}
                return
            }
            for (let item in data) {
                if (data[item].length === 0) {
                    delete state.filterBox[item]
                    return
                }
            }
            state.filterBox = Object.assign({}, state.filterBox, data)
        },
        [gridKey + '_EFILTER_BOX_DATA'](state, data) {
            // reset
            if (data === null) {
                state.efilterBox = {}
                return
            }
            for (let item in data) {
                if (data[item].length === 0) {
                    delete state.efilterBox[item]
                    return
                }
            }
            state.efilterBox = Object.assign({}, state.efilterBox, data)
        },
        [gridKey + '_SORT_BOX_DATA'](state, data) {
            if (data.prop === null) {
                state.sortBox = {}
            } else {
                state.sortBox = data
            }
        },
        [gridKey + '_ADD_WINDOW_VISIBLE'](state, val) {
            state.add_Window_Visible = !state.add_Window_Visible
        },
        [gridKey + '_SET_WINDOW_VISIBLE'](state, val) {
            state.setting_Window_Visible = !state.setting_Window_Visible
        },
        [gridKey + '_DETAILS_WINDOW_VISIBLE'](state, val) {
            state.details_Window_Visible = !state.details_Window_Visible
        },
        [gridKey + '_REFRESH'](state, data) {
            state.refresh = !state.refresh
        },
        [gridKey + '_EDIT_WINDOW_VISIBLE'](state, val) {
            state.edit_Window_Visible = !state.edit_Window_Visible
        }
    }
}

function initOpt(opt) {
    var table = opt.table
    var newTable = []
    let initObj = {
        align: 'left',
        headerAlign: 'left',
        addLayer: 'show',
        editLayer: 'show', // show hide
        filterMultiple: true, // 筛选默认可多选
        detailsLayer: 'show', // 详情页默认展示
        default: null, // 添加时默认项
        searchKey: 'show',
        sortable: false,  // 自定义为‘custom’
        readOnly: false, // 修改的是否是否是只读不可改
        column: 'show',  // 表格列是否展示  show  hide
        width: 'auto', // 180
        displayType: 1,  // 功能按钮样式
        isExpand: false, // 180
        type: 'string'  // type: string number select remoteMethod
    }
    // 自动赋值：表格width
    table = common.setTabWidth(table, opt.gridKey)
    table.forEach(function (item) {
        if (item.children && item.children.length > 0) {
            let children = []
            item.children.forEach(value => {
                var newColunm = Object.assign({},initObj, value)
                children.push(newColunm)
            })
            var newColunm = Object.assign({},initObj, item,{children})
            newTable.push(newColunm)
        } else {
            var newColunm = Object.assign({},initObj, item)
            newTable.push(newColunm)
        }
    })
    if (opt.isPageSet === false) {
        var pager_size_opts = Vue.prototype.$table_options.pager_size_opts
        var pager_Size = Vue.prototype.$table_options.pager_Size
        opt.pager_size_opts = pager_size_opts ? pager_size_opts : opt.pager_size_opts
        opt.pager_Size = pager_Size ? pager_Size : opt.pager_Size
    }
    opt.table = newTable
    return opt;
}

export function registerModule(_this, state, gridKey) {
    if (!_this.$store) {
        console.error('未找到vuex store实例')
        return
    }
    // 为data-grid创建一个动态模块，并将其注册到vuex store中
    if (!gridKey) {
        console.error('props参数gridKey必须传入')
        return
    }
    // 模块已存在则返回
    if (_this.$store.state[gridKey]) {
        return
    }

    if(state.fn){
        state = state.fn(state)
    }
    let initState = initOpt(state)

    var mutations = createMutations(initState, gridKey)
    _this.$store.registerModule(gridKey, {
        state: initState,
        mutations,
        actions: {
            [gridKey + 'setData']({dispatch, commit}, obj) {
                _this.$store.commit(gridKey + '_SET_DATA', obj)
            },
            [gridKey + '_set_efilterbox']({dispatch, commit}, val) {
                _this.$store.commit(gridKey + '_EFILTER_BOX_DATA', val)
            },
            [gridKey + '_set_filterbox']({dispatch, commit}, val) {
                _this.$store.commit(gridKey + '_FILTER_BOX_DATA', val)
            },
            [gridKey + '_set_sortbox']({dispatch, commit}, val) {
                _this.$store.commit(gridKey + '_SORT_BOX_DATA', val)
            },
            [gridKey + '_add_Window_Visible']({dispatch, commit}, val) {
                _this.$store.commit(gridKey + '_ADD_WINDOW_VISIBLE', val)
            },
            [gridKey + '_set_Window_Visible']({dispatch, commit}, val) {
                _this.$store.commit(gridKey + '_SET_WINDOW_VISIBLE', val)
            },
            [gridKey + '_details_Window_Visible']({dispatch, commit}, data) {
                _this.$store.commit(gridKey + '_DETAILS_WINDOW_VISIBLE')
                if (data) {
                    _this.$store.commit(gridKey + '_DETAILS_WINDOW_DATA', data)
                }
            },
            [gridKey + '_set_refresh']({dispatch, commit}, obj) {
                _this.$store.commit(gridKey + '_REFRESH', obj)
            },
            [gridKey + '_edit_Window_Visible']({dispatch, commit}, data) {
                _this.$store.commit(gridKey + '_EDIT_WINDOW_VISIBLE')
                if (data) {
                    _this.$store.commit(gridKey + '_EDIT_WINDOW_DATA', data)
                }
            }
        }
    })
}

export const options = {
    getData_val: 'value', // 获取table list 数据参数，默认是data.value
    toggleRowExpansion: false, // table 是否展开
    border: true, // table 是否展示竖排 border
    requestUrl: '', // 最终请求的url
    sortBox: {}, // 存储排序信息  // 理论可以实现多列排序，目前组建展示效果不支持，功能保留
    filterBox: {}, // 存储筛选信息
    efilterBox: {}, // 存储 expend 筛选信息
    seniorSearchBox: {}, // 存储高级搜索信息
    seniorSearchType: true, // 高级搜索方式是and 还是 or
    otherSeniorSearchOpt: {},  // 其他手动添加的高级搜索项 对象内部值必须为数组.ps {key:[123,123]} 目前考虑的是模糊搜索，支持同事筛选多个
    isSeniorSearch: false, // 是否为高级搜索
    refresh: false,  // 提供一个变量watch 是否需要刷新页面
    selection: [], // 存储勾选对象
    searchKeys: ['searchAll'], // 存储search对象
    searchVal: '', // 存储search对象
    searchBtn: false, // 存储search对象
    isResetCurrentPage: false, // 是否重置  pager_CurrentPage 为1
    isRun: true, // 是否继续执行，某些方法多次执行
    arrCopy: [], // 存储arr原始对象
    defaultSearch: '',  // 默认 搜索选项
    disabledSearch: false, // 是否禁用搜索下拉 true：禁用
    isPageSet: false,  // 是否使用页面设置每页展示，覆盖用全局设置
    isLocalPages: false,  // 是否使用本地分页
    localTableData: [],  // 本地分页存储的总数据
    pager_size_opts: [15, 25, 50],  // 每页展示数量
    pager_Size: 15,   //  默认显示每页数量，和opts第一个一样
    pager_CurrentPage: 1, // 当前第几页
    isChange_CurrentPage: false, // 是否保存当前页码
    pager_Total: 0,   // 总页数
    tableData: [],  // 所有的增删改拆后的数据覆盖存储
    initTableData: [],  // 没有经过数据字典转化的数据
    add_Window_Visible: false,   // 新增弹窗显示状态
    addSucess: null,   // 新增成功后返回的对象
    edit_Window_Visible: false,  // 修改弹窗显示状态
    details_Window_Visible: false,  // 详情页弹窗显示状态
    setting_Window_Visible: false,  // table设置弹窗显示状态
    edit_Window_Data: {},  // 弹窗显示信息
    details_Window_Data: {}  // 详情显示信息
}
