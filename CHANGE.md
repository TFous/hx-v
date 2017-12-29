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
       table.forEach(function (item) {
              let newColunm = Object.assign({
                  addLayer: 'show',
                  editLayer: 'show', // show hide
                  searchKey: 'show',
                  sortable: false,  // 排序
                  readOnly: false, // 修改的是否是否是只读不可改
                  column: 'show',  // 表格列是否展示  show  hide
                  width: 'auto', // 180
                  type: 'string'  // type: string number select remoteMethod
              }, item)
              newTable.push(newColunm)
          })


```
