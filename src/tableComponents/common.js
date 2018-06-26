export function bind(fn, ctx) {
    function boundFn(a) {
        var l = arguments.length;
        return l
            ? l > 1
                ? fn.apply(ctx, arguments)
                : fn.call(ctx, a)
            : fn.call(ctx)
    }

    // 记录原始的 fn 长度
    boundFn._length = fn.length;
    return boundFn
}

/**
 * 父组建事件传递到子组建，名称相同则覆盖，没有则新增
 *
 * @param _this   vue
 * @param fn   包含事件集合的 boj
 */
export function bindFn(_this, fn) {
    let vue = _this
    let arrFn = fn
    for (let key in arrFn) {
        vue[key] = bind(arrFn[key], vue)
    }
}

export function filterependence(columns) {
    let obj = {};
    columns.forEach(function (item) {
        if (item.type === 'dependence') {
            obj[item.key] = item.dependenceVal
        }
    })
    return obj
}

export function trim(text) {
    if (typeof text === 'string') {
        return text.replace(/(^\s*)|(\s*$)/g, '');
    } else {
        return text
    }
}

export function setStarTime(dateTime) {
    let times = new Date(dateTime)
    let year = times.getFullYear()
    let month = (times.getMonth() + 1).toString().length === 2 ? (times.getMonth() + 1) : `0${(times.getMonth() + 1)}`
    let day = (times.getDate()).toString().length === 2 ? (times.getDate()) : `0${(times.getDate())}`
    // let hours = (times.getHours()).toString().length === 2 ? (times.getHours()) : `0${(times.getHours())}`
    // let minutes = (times.getMinutes()).toString().length === 2 ? (times.getMinutes()) : `0${(times.getMinutes())}`
    // let seconds = (times.getSeconds()).toString().length === 2 ? (times.getSeconds()) : `0${(times.getSeconds())}`
    // return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`
    return `${year}-${month}-${day}T00:00:00Z`
}
export function endTime(dateTime) {
    let times = new Date(dateTime)
    let year = times.getFullYear()
    let month = (times.getMonth() + 1).toString().length === 2 ? (times.getMonth() + 1) : `0${(times.getMonth() + 1)}`
    let day = (times.getDate()).toString().length === 2 ? (times.getDate()) : `0${(times.getDate())}`
    return `${year}-${month}-${day}T15:59:59Z`
}

export function timeType(t) {
    let d = new Date(t).getTime()
    let times = new Date(d)
    let year = times.getFullYear()
    let month = (times.getMonth() + 1).toString().length === 2 ? (times.getMonth() + 1) : `0${(times.getMonth() + 1)}`
    let day = (times.getDate()).toString().length === 2 ? (times.getDate()) : `0${(times.getDate())}`
    return `${year}-${month}-${day}`
}

// 判断object/json 是否为空
export function isEmptyObject(e) {
    var t;
    for (t in e)
        return !1;
    return !0
}

// 数组去重
export function uniqueArr(arr) {
    if (arr.length === 0) {
        return arr
    }
    arr.sort();
    var newArr = [arr[0]];
    for (var i = 1, len = arr.length; i < len; i++) {
        if (arr[i] !== newArr[newArr.length - 1]) {
            newArr.push(arr[i]);
        }
    }
    return newArr;
}

// fetch 求情头 目前没用到。用的是页面的
export function fetchRequest(url, obj = {}) {
    const accessToken = JSON.parse(localStorage.getItem('STORAGE_IDENTITY')).access_token
    const headers = new Headers({
        'Content-Type': 'application/json; odata.metadata=minimal',
        'Authorization': `Bearer ${accessToken}`
    })
    let initObj = Object.assign({
        method: 'GET',
        headers: headers,
        mode: 'cors',
        cache: 'default'
    }, obj)
    return new Request(url, initObj)
}

export function setTabWidth(tables,gridKey) {
    let table = tables
    let tableWidthsObj = JSON.parse(localStorage.getItem('TABLES_WIDTH')) || {}
    if(tableWidthsObj[gridKey]!==undefined){
        table.forEach(function (item) {
            tableWidthsObj[gridKey].forEach(function (column) {
                if(item.title === column.name){
                    item.width = column.width
                }
            })
        })
    }
    return table
}


function hashCode(str) {
    var h = 0;
    var len = str.length;
    var t = 2147483648;
    for (var i = 0; i < len; i++) {
        h = 31 * h + str.charCodeAt(i);
        if (h > 2147483647) h %= t; //java int溢出则取模
    }
    /*var t = -2147483648 * 2;
     while (h > 2147483647) {
     h += t
     }*/
    return h;
}

//时间戳来自客户端，精确到毫秒，但仍旧有可能在在多线程下有并发，
//尤其hash化后，毫秒数前面的几位都不变化，导致不同日期hash化的值有可能存在相同，
//因此使用下面的随机数函数，在时间戳上加随机数，保证hash化的结果差异会比较大
/*
 ** randomWord 产生任意长度随机字母数字组合
 ** randomFlag-是否任意长度 min-任意长度最小位[固定位数] max-任意长度最大位
 ** 用法  randomWord(false,6);规定位数 flash
 *      randomWord(true,3，6);长度不定，true
 * arr变量可以把其他字符加入，如以后需要小写字母，直接加入即可
 */
function randomWord(randomFlag, min, max) {
    var str = "",
        range = min,
        arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    // 随机产生
    if (randomFlag) {
        range = Math.round(Math.random() * (max - min)) + min;
    }
    for (var i = 0; i < range; i++) {
        var pos = Math.round(Math.random() * (arr.length - 1));
        str += arr[pos];
    }
    return str;
}
export function gethashcode() {
    //定义一个时间戳，计算与1970年相差的毫秒数  用来获得唯一时间
    var timestamp = (new Date()).valueOf();
    var myRandom=randomWord(false,6);
    var hashcode=hashCode(myRandom+timestamp.toString());
    return hashcode.toString().substr(0,4);
}
