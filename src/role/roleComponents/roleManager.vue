<template>
  <div class="template">
    <div class="header">
      <h2>权限管理</h2>
    </div>
    <div class="content">
      <Row>
        <Col span="9">
        <role-ztree></role-ztree>
        </Col>
        <Col span="1">
        &nbsp;
        </Col>
        <Col span="14">
        <role-details></role-details>
        </Col>
      </Row>
    </div>
  </div>
</template>
<script type="text/javascript">
  //    import roleType from './roleType.vue'
  import roleDetails from './roleDetails.vue'
  import roleZtree from './roleZtree.vue'
  import Vue from 'vue'
  export default {
    data () {
      return {}
    },
    methods: {},
    components: {
      'role-ztree': roleZtree,
      'role-details': roleDetails
    }
  }
</script>
<style lang="scss" rel="stylesheet/scss">
  .ztree li span.button.add {
    margin-right: 2px;
    background-position: -144px 0px;
    vertical-align: top;
  }

  .template {
    background: #fff;
    padding: 12px;
  }

  .pagerHead {
    padding: 12px 0px;
  }

  .header {
    padding: 12px 0px;
    h2 {
      border-left: 6px solid #39f;
      padding-left: 12px;
      font-size: 24px;
    }
  }

  .filterBox {
    margin-top: 20px;
    label {
      font-weight: 500 !important;
    }
    .filterName {
      margin-right: 12px;
      margin-bottom: 0px !important;
      vertical-align: middle;
    }
  }

</style>
