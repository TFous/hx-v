import Vue from 'vue';
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

const hxqh = {
    xdetails,
    xedit,
    xpagers,
    xadd,
    xtable,
    xheaderBar,
    common,
    validate
};

const install = function (Vue, baseUrl = {}) {
    Object.keys(hxqh).forEach((key) => {
        Vue.component(key, hxqh[key]['default']);
    });
    // Object.keys(hxqh).forEach(function (key) {
    //     return Vue.component(key, hxqh[key]['default']);
    // });
    Vue.$validate = validate.validate;
    Vue.$baseUrl = baseUrl;
    Vue.$xvuex = xvuex;
    Vue.prototype.$baseUrl = baseUrl;
    Vue.prototype.$xvuex = xvuex;
    Vue.prototype.$validate = validate.validate;
};
const table= Object.assign({}, hxqh, {install})
// module.exports = table   // eslint-disable-line no-undef
export default table
