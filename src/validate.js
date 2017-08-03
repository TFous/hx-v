export const validate = {
  required: function (rule, value, callback) {
    const reg = new RegExp('[`~!@#$^&*()=|{}\':;\',\\[\\]<>/?~！@#￥……&*（）——|{}【】‘；：”“\'。，、？%+_]');
    if (value !== '' && value !== undefined && value !== null && value.toString()
        .length !== 0 && !reg.test(value)) {
      callback();
    } else {
      callback(new Error(rule.message || '必填且不超过100字节,不能含有特殊字符'));
    }
  },
  maxLeng: function (rule, value, callback) {
    let length = strLeng(value);
    let max = rule.max ? rule.max : 50;
    if (length > max) {
      callback(new Error(rule.message || `不得超过${max}字节数`));
    } else {
      callback();
    }
  },
  decimal: function (rule, value, callback) {
    let max = rule.max ? rule.max : 2;
    if (value === null || value === '') {
      callback();
    } else if (value.toString().indexOf('.') > -1) {
      let length = value.toString().split('.')[1].length
      if (length <= max) {
        callback();
      } else {
        callback(new Error(rule.message || `小数点最多${max}位`));
      }
    } else {
      callback();
    }
  },
  regEmail: function (rule, value, callback) {
    const reg = new RegExp('^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$');
    if (reg.test(value) || value === null || value === '') {
      callback();
    } else {
      callback(new Error('Email地址格式不正确'));
    }
  },
  regPhone: function (rule, value, callback) {
    const reg = new RegExp('^1[3|4|5|7|8][0-9]{9}$');
    if (reg.test(value) || value === null || value === '') {
      callback();
    } else {
      callback(new Error('手机号码格式不正确'));
    }
  }
};

// 返回字节数
export function strLeng(str) {
  if (str == null) {
    return 0;
  }
  if (typeof str !== 'string') {
    str += '';
  }
  return str.replace(/[^x00-xff]/g, '01').length;
}

// 去掉首尾空格的正则表达式
export function trim(s) {
  return s.replace(/(^\s*)|(\s*$)/g, '');
}
