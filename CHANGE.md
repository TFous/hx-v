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
```
