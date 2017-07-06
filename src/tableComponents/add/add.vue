<template>
  <div>
    <Modal
      v-model="show"
      :title="'新增 - '+options.title"
      @on-cancel="setAddVisible"
      :mask-closable="false"
      width="980"
    >
      <div class="add">
        <Row>
          <Col span="24">
          <div class="box-body">
            <div class="row item_input_row">
              <Form ref="addForm"
                    :model="dataMsg"
                    :label-width="150">
                <slot></slot>
                <slot name="main">
                  <template v-for="(item, key, index) in getOptions.arr">
                    <template v-if="item.add_hide!==1 && item.add_hide !== 'relyOn'">
                      <div class="xtable-left">
                        <template v-if="item.type ==='date'">
                          <Form-item
                            :prop="item.key"
                            :label="item.title"
                            :rules="item.rules"
                          >
                            <Date-picker
                              :editable="false"
                              type="date"
                              placeholder="选择日期"
                              v-model="dataMsg[item.key]">
                            </Date-picker>
                          </Form-item>
                        </template>
                        <template v-else-if="item.type ==='select'">
                          <Form-item
                            :prop="item.key"
                            :label="item.title"
                            :rules="item.rules"
                          >
                            <Select v-model="dataMsg[item.key]" placeholder="请选择...">
                              <Option
                                :key="key"
                                v-for="a in getOptions[item.key]"
                                :label="a.label"
                                :value="a.values">
                              </Option>
                            </Select>
                          </Form-item>
                        </template>
                        <template v-else-if="item.type ==='number'">
                          <Form-item
                            :prop="item.key"
                            :label="item.title"
                            :rules="item.rules"
                          >
                            <Input-number
                              v-model="dataMsg[item.key]"
                              placeholder="请输入内容"
                              class="myNumberInput"
                            ></Input-number>
                          </Form-item>
                        </template>
                        <template v-else-if="item.type ==='textarea'">
                          <Form-item
                            :prop="item.key"
                            :label="item.title"
                            :rules="item.rules"
                          >
                            <Input v-model="dataMsg[item.key]"
                                   type="textarea"
                                   :autosize="{minRows: 2,maxRows: 5}"
                                   placeholder="请输入...">
                            </Input>
                          </Form-item>
                        </template>
                        <template v-else>
                          <Form-item
                            :prop="item.key"
                            :label="item.title"
                            :rules="item.rules"
                          >
                            <Input
                              v-model="dataMsg[item.key]"
                              placeholder="请输入内容"
                            ></Input>
                          </Form-item>
                        </template>
                      </div>
                    </template>
                  </template>
                </slot>
              </Form>
            </div>
          </div>
          </Col>
        </Row>
      </div>
        <div slot="footer">
          <Button @click="setAddVisible">取消</Button>
          <!--<Button type="info" @click="handleReset('addForm')">重置</Button>-->
          <Button type="primary" @click="handleSubmit('addForm')">提交</Button>
        </div>
    </Modal>
  </div>
</template>
<script>
  import urlAppend from 'url-append'
  import * as xVuex from '../xVuex.js'
  import * as common from '../common.js'
  import o from 'o.js'
  export default {
    data () {
      return {
        show: false,
        dataMsg: Object
      }
    },
    props: {
      // api接口
      addFn: Function,
      options: Object
    },
    updated () {
    },
    beforeMount () {
//            防止组建先执行报错，放入子组建执行生成 vuex
      xVuex.registerModule(this, this.options, this.options.gridKey)
//            表单对象
      this.dataMsg = Object.assign({}, common.filterData(this.getOptions.arr))
    },
    mounted: function () {
      try {
        let arrFn = this.addFn()
        common.bindFn(this, arrFn)
      } catch (e) {
      }
      xVuex.registerModule(this, this.options, this.options.gridKey)
//      this.dataMsg = common.filterData(this.getOptions.arr)
    },
    computed: {
      getOptions () {
        return this.$store.state[this.options.gridKey]
      }
    },
    watch: {
      'getOptions.add_Window_Visible': {
        handler: function (val, oldVal) {
          this.show = val
        },
        deep: true
      }
    },
    updated () {
    },
    methods: {
//      筛选方法
      remoteMethod (val) {
      },
      setAddVisible (val) {
        this.$store.dispatch(this.options.gridKey + '_add_Window_Visible')
        this.handleReset('addForm')
      },
      handleSubmit (formName) {
        let _self = this
        this.$refs[formName].validate((valid) => {
          if (valid) {
            let newData = Object.assign({}, _self.dataMsg)
//            为date 设置null
            for (let item in newData) {
              if (newData[item] === '') {
                newData[item] = null
              }
            }
            let url = _self.options.api.split('?$filter')[0]
            o(url).post(newData).save().then(function (data) {
              _self.$Message.success('新增成功')
              _self.$store.dispatch(_self.options.gridKey + '_set_refresh')
              _self.setAddVisible() // 关闭弹窗
            })
          } else {
            console.log('error submit!!')
            return false
          }
        })
      },
      handleReset (name) {
        this.$refs[name].resetFields()
      }
    }
  }
</script>
<style scoped>

</style>
