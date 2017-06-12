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
                <template v-for="(item, key, index) in options.arr" v-if="item.add_hide!==1">
                  <div style="width:50%; float: left;height: 57px;">
                    <template v-if="item.type ==='data'">
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
                        <Select v-model="dataMsg[item.key]" placeholder="请输入内容">
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
                          v-model="dataMsg[item.key]"
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
                          v-model="dataMsg[item.key]"
                          placeholder="请输入内容"
                        ></Input>
                      </Form-item>
                    </template>
                  </div>
                </template>
              </Form>
            </div>
          </div>
          </Col>
        </Row>
      </div>
      <div slot="footer">
        <Button @click="setAddVisible">取消</Button>
        <Button type="info" @click="handleReset('addForm')">重置</Button>
        <Button type="primary" @click="handleSubmit('addForm')">提交</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
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
    props: ['options'],
    beforeMount () {
//            防止组建先执行报错，放入子组建执行生成 vuex
      xVuex.registerModule(this, this.options, this.options.gridKey)
//            表单对象
      this.dataMsg = common.filterData(this.getOptions.arr)
    },
    mounted: function () {
      xVuex.registerModule(this, this.options, this.options.gridKey)
      this.dataMsg = common.filterData(this.getOptions.arr)
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
    methods: {
      setAddVisible (val) {
        this.$store.dispatch(this.options.gridKey + '_add_Window_Visible')
        this.handleReset('addForm')
      },
      handleSubmit (formName) {
        let _self = this
        this.$refs[formName].validate((valid) => {
          if (valid) {
            o(_self.options.api).post(_self.dataMsg).save().then(function (data) {
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
