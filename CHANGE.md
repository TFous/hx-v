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
