<template>
  <div>
    <el-dialog
      :title="'新增 - '+options.title"
      class="formDialog"
      :close-on-click-modal="false"
      @close="cleseFn"
      :visible.sync="show"
      :style="addStyle">
      <slot name="main">
        <el-form ref="addLayer" :label-position="labelPosition" label-width="150px" :model="dataMsg">
          <template v-for="(item, key, index) in getState.table" v-if="item.addLayer!=='hide'">
            <div class="xtable-left">
              <template v-if="item.type ==='date'">
                <el-form-item
                  :prop="item.key"
                  :label="item.title"
                  :rules="item.rules"
                >
                  <div class="block">
                    <el-date-picker
                      :clearable="true"
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
                  <el-select :clearable="true" v-model="dataMsg[item.key]" placeholder="请选择">
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
                    :clearable="true"
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
                    :clearable="true"
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
                    v-model="dataMsg[item.key]"
                    filterable
                    remote
                    :clearable="true"
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
                    :clearable="true"
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
        <el-button type="primary" @click="handleSubmit('addLayer')">提 交</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import Vue from 'vue'
  import urlAppend from 'url-append'
  import * as xVuex from '../xVuex.js'
  import * as common from '../common.js'
  import clone from 'clone'

  export default {
    data() {
      return {
        labelPosition: 'right', // label 对齐方式
        show: false,
        bntShow: true,
        dataMsg: Object
      }
    },
    props: {
      // api接口
      addFn: Function,
      options: Object,
      addStyle: String,
      addClass: {
        type: String,
        default: 'hxLayer',
      }
    },
    updated() {
    },
    mounted: function () {
      let _this = this
      let filterData = common.filterData(_this.getState.table)
      _this.dataMsg = clone(filterData)
      try {
        let arrFn = _this.addFn()
        common.bindFn(_this, arrFn)
      } catch (e) {
      }
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
      'getState.add_Window_Visible': {
        handler: function (val, oldVal) {
          this.show = val
        },
        deep: true
      }
    },
    methods: {
      cleseFn(val) {
        this.$store.dispatch(this.options.gridKey + '_add_Window_Visible')
      },
      setNumber(val) {
        this.dataMsg[val] = Number(this.dataMsg[val])
      },
//      筛选方法
      remoteMethod(val) {
      },
      setAddVisible(val) {
        this.$store.dispatch(this.options.gridKey + '_add_Window_Visible')
        this.handleReset('addForm')
      },
      handleSubmit(formName) {
        let _self = this
        let newData = _self.dataMsg
        this.$refs[formName].validate((valid) => {
          if (valid) {
            let url = this.getState.addUrl
            let string1 = "{\"WarehousingCompany\":210,\"Warehouse\":4290,\"Variety\":\"CS\",\"Weight\":\"2\",\"Amount\":\"2\"}"
            let requestDataHeader = Vue.prototype.$api.request(url, {method: 'POST', body: JSON.stringify(newData)})
            fetch(requestDataHeader).then(resp => {
              return resp.text()
            }).then(data => {
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
