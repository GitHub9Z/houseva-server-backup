////////////////////////////////////////////////////////
//
// 工具类 js 
//
////////////////////////////////////////////////////////

var Util = {

}

/**
 * 评测梯度标准
 */
Util.UNIT_STANDART = {

    'efficiency': {
        'A': 0.9,
        'B': 0.8,
        'C': 0.7,
        'D': 0,
    },

    // 户型方正-开进比 
    'unitWidthDepthRatio': {
        'A': 0.9,
        'B': 0.8,
        'C': 0.7,
        'D': 0,
    },
    // 方正率
    'unitSquareRatio': {
        'A': 0.9,
        'B': 0.8,
        'C': 0.7,
        'D': 0,
    },

    /*
    卧室梯度标准：	
    （依赖数据统计）
    */
    'bed_room': {
        'A': 18,
        'B': 12,
        'C': 8,
        'D': 0, 
    }, 

    'study_room': {
        'A': 9,
        'B': 7,
        'C': 5,
        'D': 0,
    },
 
    // 客餐厅
    'living_dining_room': {
        'A': 36,
        'B': 25,
        'C': 20,
        'D': 0,
    },

    'living_room': {
        'A': 20,
        'B': 15,
        'C': 10,
        'D': 0,
    },
 
    'dining_room': {
        'A': 18,
        'B': 12,
        'C': 8,
        'D': 0,
    },
 
    'kitchen': {
        'A': 8,
        'B': 6,
        'C': 5,
        'D': 0,
    },

    'toliet' : {
        'A': 6,
        'B': 4,
        'C': 3.5,
        'D': 0,
    },

    // E级，阳台紧凑标准     s<6
    // D级，阳台经济标准     6≤s<9
    // C级，阳台舒适标准     9≤s<12
    // B级，阳台豪华标准     12≤s<15
    // A级，阳台奢华标准     15≤s
    'balcony': {
        'A': 12,
        'B': 6,
        'C': 4,
        'D': 0,
    },

    // 纯走道标准
    // （依赖数据统计） [特殊，采用小于比较]
    'passage': {
        'A': 0.07,
        'B': 0.10,
        'C': 1,
    },
    // 储藏占比标准
    // [依赖数据统计]独立储藏空间面积不小于套型建筑面积的3%
    'storage': {
        'A': 0.11,
        'B': 0.085,
        'C': 0,
    },
    'lobby': {
        'A': 4.5,
        'B': 2.5,
        'C': 1.5,
        'D': 0,
    },
    
    // 功能流线等级 (越小越好)
    'region_flow' : {
        'A': 5,
        'B': 10,
        'C': 100, // 最大值
    },

    // 窗户窗深比
    'window_depth_ratio' : {
        'A': '0.6',
        'B': '0.4',
        'C': '0.3',
        'D': 0,
    },
    'detai_item_key' : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
    // 细节项
    'detail_items' : {
        'door': [
            "入口处应设置门厅（玄关），否则缺少室内外空间过渡",
            "门厅（玄关）宜起到遮蔽视线的作用，否则室外容易对室内一眼望穿，干扰隐私",
            "门厅（玄关）储藏不宜小于0.5方，便于满足鞋，雨伞，运动等物品储藏",
            "门厅（玄关）进深不宜小于1.5米，否则不利于形成室内外的空间过渡",
        ],
        'living_room': [
            "客厅中电视柜侧的实墙面长度应大于3米，便于布置电视等家具",
            "客厅宜相对独立，便于形成完整空间",
            "客厅不宜与电梯机房、电梯井以及噪声振动的用房相邻，否则应做隔声减振处理",
            "客厅内，不宜有直接开向卧室的门，避免客厅对卧室的干扰",
            "客厅内，不宜有直接开向书房的门，避免客厅对书房的干扰",
        ],
        'dining_room': [
            "餐厅宜相对独立，便于形成完整空间",
            "餐厅储藏面积应大于0.5方，便于储藏饮品，小家电",
            "餐厅不宜与电梯机房、电梯井以及噪声振动的用房相邻，否则应做隔声减振处理",
            "餐厅内，不宜有直接开向卧室的门，避免餐厅对卧室的干扰",
            "餐厅内，不宜有直接开向书房的门，避免餐厅对书房的干扰",
        ], 
        'bedroom': [
            "卧室，书房不应与电梯机房、电梯井以及噪声振动的设备用房相邻，否则应做隔声减振处理",
            "卧室，书房不宜与有噪声振动的管道井相邻，如水管井等，否则应做隔声减振处理",
            "卧室，书房不宜与厨房相邻，避免厨房操作及热水器噪声的影响",
            "卧室门不宜与户门相对，避免入户时对卧室视线干扰",
            "卧室与卧室的门距离小于2米时，不宜相对，避免进出时视线隐私干扰",
        ], 
        'kitchen': [
            "厨房台面布局宜U字形或二字形，便于增加操作台面长度",
            "厨房操作台的长度不应小于2.1米,便于摆放电器，灶具，水槽等设备",
            "厨房储藏面积不应小于1.8方，便于厨房台面，冰箱，水槽等设备",
        ],
        'toliet': [
            "公卫宜分离式设计，洗手台与马桶，淋浴分离，提高公卫利用率",
            "卫生间不应直接布置在下层住户的卧室、起居室（厅）、厨房和餐厅的上层",
            "卫生间门不应直接开向厨房，否则相互干扰，影响隐私与雅观",
            "卫生间门不应直接开向餐厅，否则相互干扰，影响隐私与雅观",
            "卫生间门不应直接开向客厅，否则相互干扰，影响隐私与雅观",
            "卫生间门不应直接正对卧室床，否则影响雅观",
            "公卫门与卧室门距离小于2米时，不应直接相对，否则影响雅观",
        ],
        'balcony': [
            '阳台储藏面积宜大于0.5方，便于布置洗水台，洗衣机',
            '阳台进深宜大于1.2米，进深太小，不便于使用',
        ], 
    },
    // 'badLevel': {
    //     'efficiency': 'D',
    // }
}


Util.mapLevelInt = function(key) {
    if (key == 'A') {
        return 1;
    } else if (key == 'B') {
        return 2;
    } else if (key == 'C') {
        return 3;
    } else if (key == 'D') {
        return 4;
    } else if (key == 'E') {
        return 5;
    } else {
        return 6;
    }
}


Util.updateTitleText = function(str) {
    if (str) {
        $(".title-bar .title").html(str);
    }
}


Util.updateTitleTextBySitePlanData = function(data) {
    var lightSitePlan = data ? data.lightSitePlan : null;
    if (lightSitePlan) {
        Util.updateTitleText(lightSitePlan.real_estate_name);
    }
}

Util.updateTitleTextByRealEstateName = function(data) {
    if (data) {
        Util.updateTitleText(data.real_estate_name);
    }
}


Util.isObjectType = function(v) {
    return typeof v==='object' && v !== null;
}

Util.groupArrayByKey = function(arr, key) {
    if (!arr || arr.length <= 0) {
        return [];
    }

    var distincKv = [];
    var groups = {};
    for(var i in arr) {
        var v = arr[i];
        var kv = v[key];
        if (!distincKv.includes(kv)) {
            distincKv.push(kv);
            groups[kv] = [];
        }  
        groups[kv].push(v);
    }

    return groups;
}


/**
 * 解析url hash key/value格式
 * @param {*} hash 
 */
Util.parseUrlHash = function(hash) {
    var hashStr = hash.substr(1);
    var result = hashStr.split('&').reduce(function (result, item) {
        var parts = item.split('=');
        result[parts[0]] = parts[1];
        return result;
    }, {});
    return result;
}


Util.toHashString = function(params) {
    if (!params) {
        return "";
    }
    if (!Util.isObjectType(params)) {
        return params;
    }

    var result = "";
    for (var key in params) {
        result = (key + '=' + params[key]) + '&';
    }
    if (result) {
        result = result.substr(0, result.length - 1);
    }
    return result;
}


/**
 * 渲染光照时长横Bar
 * @param label 名称
 * @param value 值
 * @param percent bar长度百分比
 * @param level bar级别，正常/警告/严重, 改变颜色
 */
Util.addHBar = function(viewContainer, options) {
    var html = "<div class='h-bar'><div class='name'><span class='name-label'></span><span class='name-sub-label'></span></div>" + 
    "<div class='value-bar'><div class='value-content vertical-align-container'>" + 
    "<span class='value'></span></div></div>" + 
    "<div class='value-level'></div>" + 
    "</div>";
    var view = $(html);
    var label = options.label;
    var value = options.value;
    var percent = options.percent;
    var level = options.level;
    var subValue = options.subValue;
    var minWidth = options.minWidth;
    var type = options.type;

    var isPlainValue = false;
    view.find('.name-label').html(label);
    view.find('.name-sub-label').html(options.subLabel);
    var valueView = view.find('.value');    
    if (type == 'plain_value') {
        isPlainValue = true;
        valueView.html(value);
    } else if (type == 'checkbox') {
        isPlainValue = true;
        var checkedStr = value ? 'checked' : '';
        var html = (value) ? "<img src='/image/checked.png'></img>" : "<img src='/image/cross.png'></img>";
        if (value) {
            valueView.parents('.value-content').removeClass('color-warn');
        } else {
            valueView.parents('.value-content').addClass('color-warn');
        }
        valueView.html(html);
    } else {
        valueView.html(value);
    }
 
    if (isPlainValue) {
        Util.setHBarAutoValueWidth(view);
    }

    var color = 0;
    var badLevel = options.badLevel;
    if (!badLevel) {
        badLevel = 'D';
    }
    if (level != badLevel) {
        color = "#ffe500";
    } else { // bad警戒色
        color = "#ff8059";
    }
    view.find('.value-content').css("background", color);

    var flex = '';
    view.find('.value-content').css("width", percent + "%");
    flex = '1';
    
    view.find('.value-bar').css('flex', flex);
    view.find(".value-level").html(level ? (level + '级') : '');
    if (minWidth) {
        view.find('.value-content').css("min-width", minWidth);
    }  
    // subValue render
    if (subValue) {
        view.find('.value-sub').html(subValue);
    } else {
        view.find('.value-sub').hide();
    }
    viewContainer.append(view);
}


Util.setHBarAutoValueWidth = function(view) {
    view.find('.value-bar').addClass('value-bar-plain');
}


Util.formatRatioDisplay = function(viewModel, firstKey, secondKey) {
    if (!viewModel) {
        return '';
    }
    var result = '';
    var first = Number(viewModel[firstKey]);
    var second = Number(viewModel[secondKey]);
    if (first && second && !isNaN(first) && !isNaN(second) && second != 0) {
        result = first / second;
        result = result.toFixed(2);
    }
    return result;
}

Util.renderImage = function(viewParent, imgUrl) {
    if (imgUrl){
        viewParent.find(".image-box img").attr("src", imgUrl);
        viewParent.find(".number-box").show();
    } else {
        viewParent.find(".image-box img").attr("src", "");
        viewParent.find(".number-box").hide();
    }
}


Util.convertToCssClassKey = function(str) {
    if (!str) {
        return "";
    }
    var arr = str.split('_');
    return arr.join('-');
}


Util.trackDataView = function(params) {
    $.ajax({
        url: "/api/trackDataView",
        data: params,
        dataType: 'json',
        success: function(response){
            // donothing
            // console.log('track:', params, response);
        }, 
        error: function(response) {
            console.debug(response);
        }
    });
}

// 埋点接口
Util.trackPageView = function() {

}

Util.renderComment = function(view, comment) {
    view.find(".comment").html(comment ?  ('点评：' + comment) : '');
}