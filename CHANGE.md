## 更新记录
> * 2018.4.27
>> * 修改刷新按钮不刷新（拼接hashcode）
>> * 修改批量删除方法，`"Content-Type": "application/x-www-form-urlencoded"`
>> * 进一步优化接口重复加载


> * 2018.5.28
>> * table 功能按钮新增两种显示效果，actionDisplayType  1  2 ，表格按钮svg 是外部引用的
>> * 可以更具具体需求修改每行按钮的显示影藏  fn=>  btnToggle


> * 2018.7.1
>> * table 功能按钮新增两种显示效果，actionDisplayType  1  2 ，表格按钮svg 是外部引用的
>> * 可以更具具体需求修改每行按钮的显示影藏  fn=>  btnToggle 这个功能废弃掉，table组件中不能
执行任何方法。改为下面的方法



> * 2018.7.13
>> * table 支持复杂表头，目前只支持二级，同时修改表头宽度记录。
>> * 表格设置弹出层高度修改。

```javascript
负责表头
{
                key:'msg',
                title:'人员信息',
                children:[
                    {
                        key: 'Name',
                        title: '姓名',
                        // column:'hide',
                        displayType:1,
                        rules: [{required: true, message: '必填'}],
                        render: [
                            {
                                fn: this.showEditModel,   // 事件
                                title: '点击查看详情'  // 鼠标移到上面展示的内容
                            }
                        ]
                    },
                    {
                        key: 'Phone',
                        title: '联系手机',
                        rules: [{required: true, message: '必填'}]
                    },
                ]
            },

```





```javascript
/**
     * 设置展现给用户的表格数据
     * @param tableData 表格数据
     */
    setTableData(tableData) {
        let _self = this
        let initData = clone(tableData)
        initData.forEach(function (item) {
            //0入职 1转正 2 调岗 3改聘 4离职 5再入职 6删除
            if(item.WorkingStatus == _self.$api.ValueTokey('WorkingStatusEnum','待岗')){ //待岗
            // 对应数据对象中新增btnShow 属性，存入 属性为是 table 中对应clomn，值为想要显示的index下标
                item.btnShow = JSON.stringify({
                    action:'0,6'
                })
            }
        })
        this.$store.dispatch(this.options.gridKey + 'setData', {tableData: initData})
    }

```



## 注意事项

> * 表格column显示，title不能同名，不然显示与否会牵扯到同名的（理论上不可能重名）


## Fetch DEMO

```javascript

      let url1 = `http://rbs.cefcfco.com:6789/api/manage/odata/InterestRateTypeDict(1)`
      let url2 = `http://rbs.cefcfco.com:6789/api/manage/odata/InterestRateTypeDict(2)`
      var myRequest1 = Vue.prototype.$api.request(url1)
      var myRequest2 = Vue.prototype.$api.request(url2)
      let myRequests = [myRequest1, myRequest2]
      Promise.all(myRequests.map(myRequest =>
        fetch(myRequest).then(resp => resp.json())
      )).then(texts => {
        console.log(texts)
      })
      fetch(myRequest1).then(function (response) {
        console.log(response)
        return response.text()
      }).then(function (myBlob) {
        console.log(myBlob)
      })



      // colunm 默认添加
      // 当type 为 dependence 时为依赖关系，需填写  dependenceVal: 默认值
       table.forEach(function (item) {
              let newColunm = Object.assign({
                  addLayer: 'show',
                  editLayer: 'show', // show hide
                  searchKey: 'show',
                  sortable: false,  // 排序
                  readOnly: false, // 修改的是否是否是只读不可改
                  column: 'show',  // 表格列是否展示  show  hide
                  width: 'auto', // 180
                  type: 'string'  // type: string number select remoteMethod dependence
              }, item)
              newTable.push(newColunm)
          })

```

``` javascript
        // render 三种形式
        render: [
        //  a 标签
            {
              tag: 'a',
              href: 'http://www.baidu.com',
              text: '删除'
            },
        //  button
            {
                fn: this.editRow,
                type: 'primary',
                tag: 'button',
                text: '编辑'
            },
            //  其他
            {
                fn: this.editRow,   // 事件
                class: 'classname', // 此项可没有，默认为.cell-cursor
                tips: '点击查看详情'  // 鼠标移到上面展示的内容
            }
        ]

```

``` javascript
// table 折叠expand
        <xtable
                :tableFn="tableFn"
                :options="options"
            >
                <span slot="expand">
                     <el-table-column
                     fixed="left"  // 必须，否则某些页面会出现问题
                      type="expand">
                            <template slot-scope="props">
                        <el-table
                            :data="props.row.ClientSecondSeat"
                            style="width: 100%">
                            <el-table-column
                                label="客户ID"
                                prop="ClientId">
                            </el-table-column>
                            <el-table-column
                                label="次席状态（SecondSeatStatus）"
                                prop="SecondSeatStatus">
                            </el-table-column>
                            <el-table-column
                                label="CreationTime时间"
                                prop="CreationTime">
                            </el-table-column>
                        </el-table>
                    </template>
                        </el-table-column>
                </span>
            </xtable>

```

``` javascript
// 新增全局分页设置
isSetPage: false,  // 是否使用页面设置每页展示，覆盖用全局设置
当为true时，页面使用不实用全局，使用当前设置的

Vue.use(hxqh,{
    pager_size_opts: [30, 50, 100],  // 每页展示数量
    pager_Size: 30   //  默认显示每页数量，和opts第一个一样
})
```

```javascript
// 可替换组建内部所有方法
    headerFn() {
        return {}
    }

    tableFn() {
        return {}
    }

    addFn() {
        return {}
    }

    editFn() {
        return {}
    }

```
