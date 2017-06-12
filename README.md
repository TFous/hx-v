## Install

### Install vue-webpack project in the first place

Use [iview-project](https://github.com/iview/iview-project)(Recommended) Or [vue-cli](https://github.com/vuejs/vue-cli)

### Install hx-v

using npm
```
npm install hx-v --save
```
## Usage

```html
<template>
    <Slider v-model="value" range></Slider>
</template>
<script>
    export default {
        data () {
            return {
                value: [20, 50]
            }
        }
    }
</script>
```
Use css
```js
import hxqh from 'hx-v'
import 'hx-v/dist/styles/common.css'
// 存储项目url
let baseUrl = {
  identitySiteRoot: localStorage.getItem('identitySiteRootSite'),
  roleUrl: localStorage.getItem('roleUrlSite'),
  appUrl: localStorage.getItem('appUrlSite'),
  rbs: localStorage.getItem('rbsSite'),
  webApiRoot: localStorage.getItem('webApiRootSite')
}
Vue.use(hxqh, baseUrl)
```

## Browser Support

Normal browsers and Internet Explorer 9+.
