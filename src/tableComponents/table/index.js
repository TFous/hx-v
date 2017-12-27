import xtable from './table.vue';

xtable.install = function(Vue) {
    Vue.component(xtable.name, xtable);
};

export default xtable;

