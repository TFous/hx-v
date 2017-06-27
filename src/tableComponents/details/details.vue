<template>
    <div>
        <Modal
                v-model="show"
                :title="'详情 - '+ title"
                @on-cancel="setVisible"
                :mask-closable="false"
                width="980"
        >
            <div class="details">
                <Row>
                    <Col span="24">
                    <div class="box-body">
                        <div class="row item_input_row">
                            <Form ref="editForm"
                                  :model="eidtData"
                                  :label-width="120">
                                <template v-for="(item, key, index) in options.arr" v-if="item.edit_hide!==1">
                                    <div class="xtable-left">
                                        <Form-item
                                                :prop="item.key"
                                                :label="item.title + '：'"
                                        >
                                            {{eidtData[item.key]}}
                                        </Form-item>
                                    </div>
                                </template>
                            </Form>
                        </div>
                    </div>
                    </Col>
                </Row>
            </div>
            <div slot="footer">
                <Button @click="setVisible">关闭</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
    //  import o from 'o.js'
    export default {
        data () {
            return {
                show: false,
                eidtData: {},
                title: ''
            }
        },
        props: ['options'],
        mounted: function () {
            this.title = this.getOptions.edit_Window_Data.Name || this.options.title
        },
        computed: {
            getOptions () {
                return this.$store.state[this.options.gridKey]
            }
        },
        watch: {
            'getOptions.details_Window_Visible': {
                handler: function (val, oldVal) {
                    this.show = val

                    if (val === true) {
                        this.eidtData = Object.assign({}, this.getOptions.details_Window_Data)
                      try {
                        delete this.eidtData['_index']  // 莫名多出了个——index 删了
                        delete this.eidtData['cellClassName']
                      } catch (e) {
                      }
                    } else {
                        this.eidtData = {}
                    }
                },
                deep: true
            }
        },
        methods: {
            setVisible () {
                this.$store.dispatch(this.options.gridKey + '_details_Window_Visible')
            }
        }
    }
</script>
<style scoped>

</style>
