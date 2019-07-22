var validate = require('./validate.js');
var xtable = require('./tableComponents/table');
var xheaderBar = require('./tableComponents/headerBar');
var xadd = require('./tableComponents/add');
var xdetails = require('./tableComponents/details');
var xedit = require('./tableComponents/edit');
var xpagers = require('./tableComponents/pagers');
// xvuex
var xvuex = require('./tableComponents/xVuex');
var common = require('./tableComponents/common');

const components = {
    xdetails,
    xedit,
    xpagers,
    xadd,
    xtable,
    xheaderBar,
    validate
};

const install = function (Vue, options = {}) {
    Object.keys(components).forEach((key) => {
        Vue.component(key, components[key]['default']);
    });
    // Object.keys(hxqh).forEach(function (key) {
    //     return Vue.component(key, hxqh[key]['default']);
    // });
    Vue.$validate = validate.validate;
    Vue.$table_options = options;
    Vue.$xvuex = xvuex;
    Vue.$common = common;
    Vue.prototype.$common = common;  // 组建内公用方法，挂在后外部可用
    Vue.prototype.$table_options = options;  // 用于设置组建内部的一些默认值
    Vue.prototype.$xvuex = xvuex;
    Vue.prototype.$validate = validate.validate;  // 组建内公用验证方法，挂在后外部可用
};
module.exports = {
    version: '1.5.0',
    xdetails,
    xedit,
    xpagers,
    xadd,
    xtable,
    xheaderBar,
    validate,
    install
};
module.exports.default = module.exports;
// export default hx_table;
