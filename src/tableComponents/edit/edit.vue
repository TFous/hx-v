<template>
  <div>
    <Modal
      v-model="show"
      :title="'编辑 - '+ title"
      @on-cancel="setVisible"
      :mask-closable="false"
      width="980"
    >
      <div class="edit">
        <Row>
          <Col span="24">
          <div class="box-body">
            <div class="row item_input_row">
              <Form ref="editForm"
                    :model="eidtData"
                    :label-width="150">
                <slot></slot>
                <slot name="main">
                  <template v-for="(item, key, index) in options.arr" v-if="item.edit_hide!==1">
                    <div class="xtable-left">
                      <template v-if="item.type ==='date'">
                        <Form-item
                          :prop="item.key"
                          :label="item.title"
                          :rules="item.rules"
                        >
                          <Date-picker
                            :disabled="item.disabled"
                            :editable="false"
                            type="date"
                            placeholder="选择日期"
                            v-model="eidtData[item.key]">
                          </Date-picker>
                        </Form-item>
                      </template>
                      <template v-else-if="item.type ==='select'">
                        <Form-item
                          :prop="item.key"
                          :label="item.title"
                          :rules="item.rules"
                        >
                          <Select
                            :disabled="item.disabled"
                            v-model="eidtData[item.key]" placeholder="请选择...">
                            <Option
                              :key="key"
                              v-for="a in options[item.key]"
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
                            :disabled="item.disabled"
                            v-model="eidtData[item.key]"
                            class="myNumberInput"
                            placeholder="请输入内容"
                          ></Input-number>
                        </Form-item>
                      </template>
                      <template v-else>
                        <Form-item
                          :prop="item.key"
                          :label="item.title"
                          :rules="item.rules"
                        >
                          <Input
                            :disabled="item.disabled"
                            v-model="eidtData[item.key]"
                            placeholder="请输入内容"
                          ></Input>
                        </Form-item>
                      </template>
                    </div>
                  </template>
                </slot>
              </Form>
            </div>
          </div>
          </Col>
        </Row>
      </div>
      <div slot="footer">
        <Button @click="setVisible">取消</Button>
        <Button type="primary" @click="handleSubmit('editForm')">提交修改</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  import o from 'o.js'
  import * as common from '../common.js'
  export default {
    data () {
      return {
        show: false,
        eidtData: {},
        title: ''
      }
    },
    props: {
      // api接口
      editFn: Function,
      options: Object
    },
    mounted: function () {
      try {
        let arrFn = this.editFn()
        common.bindFn(this, arrFn)
      } catch (e) {
      }
      this.title = this.getOptions.edit_Window_Data.Name || this.options.title
    },
    computed: {
      getOptions () {
        return this.$store.state[this.options.gridKey]
      }
    },
    watch: {
      'getOptions.edit_Window_Visible': {
        handler: function (val, oldVal) {
          this.show = val
          try {
            this.otherFn()
          } catch (e) {
          }
          if (val === true) {
            /**
             * 编辑对象，从this.getOptions.arr 筛选出必须的传给后台，过滤调其他方法新加的一些属性
             * @type {{}}
             */
            let o = {}
            for (let attr in this.getOptions.edit_Window_Data) {
              for (let item of this.getOptions.arr) {
                if (item.key) {
                  if (item.key === attr) {
                    o[item.key] = this.getOptions.edit_Window_Data[item.key]
                  }
                }
              }
            }
            this.eidtData = Object.assign({}, o)
          } else {
            this.eidtData = {}
          }
        },
        deep: false
      }
    },
    methods: {
//      otherFn () {
//
//      },
      setVisible () {
        this.$store.dispatch(this.options.gridKey + '_edit_Window_Visible')
        this.handleReset('editForm')
      },
      handleSubmit (formName) {
        let _self = this
        this.$refs[formName].validate((valid) => {
          if (valid) {
            o(_self.options.api).find(_self.eidtData.Id).patch(_self.eidtData).save().then(function (data) {
              _self.$Message.success('修改成功')
              _self.$store.dispatch(_self.options.gridKey + '_set_refresh')
              _self.setVisible() // 关闭弹窗
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
