////////////////////////////////////////////////////////
//
// 详情-户型 js 
//
////////////////////////////////////////////////////////

var viewData = null;
var num;
var unitNo;

$(function() {    
    PageRenderer.initTitleBar(); 
    
    var id = getQueryStringValueByName('id', window.location.href);

    $(".tab-header .light a").on("click", function(){
        location.href = "/detail.html?id=" + id;
    });

    $.ajax({
        url: "/api/queryZan",
        data: {real_estate_id:id},
        dataType: 'json',
        success: function(response) {
            commonHandleResponse(response, function(resp) {
                num = response.data['zan_number'];
                document.getElementById("zan-num").innerHTML='<font color="#BEBEBE">'+(++num)+'</font>';
                $(".zan").on("click", function(){
                $.ajax({
                        url: "/api/zan",
                        data: {real_estate_id:id,zan_number:1},
                        dataType: 'json',
                        success: function(response) {
                            // set cookie ?
                            commonHandleResponse(response, function(resp) {
                                document.getElementById("zan-num").innerHTML='<font color="#BEBEBE">'+(++num)+'</font>';
                                document.getElementById("zan").innerHTML='<img src="image/zan_down.png" height="40" width="40">';
                            });
                        }, 
                        error: function(response) {
                            console.log(response);
                        }
                    });
                });
            },function(resp){
                num = 0;
                document.getElementById("zan-num").innerHTML='<font color="#BEBEBE">'+num+'</font>';
                $(".zan").on("click", function(){
                $.ajax({
                        url: "/api/zan",
                        data: {real_estate_id:id,zan_number:1},
                        dataType: 'json',
                        success: function(response) {
                            // ssssss
                            commonHandleResponse(response, function(resp) {
                                document.getElementById("zan-num").innerHTML='<font color="#BEBEBE">'+(++num)+'</font>';
                                document.getElementById("zan").innerHTML='<img src="image/zan_down.png" height="40" width="40">';
                            });
                        }, 
                        error: function(response) {
                            console.log(response);
                        }
                    });
                });
            });
        }, 
        error: function(response) {
            num = 0;
            document.getElementById("zan-num").innerHTML='<font color="#BEBEBE">'+num+'</font>';
            $(".zan").on("click", function(){
                $.ajax({
                        url: "/api/zan",
                        data: {real_estate_id:id,zan_number:1},
                        dataType: 'json',
                        success: function(response) {
                            // ssssss
                            commonHandleResponse(response, function(resp) {
                                document.getElementById("zan-num").innerHTML="("+(++num)+")";
                                document.getElementById("zan").innerHTML='<img src="image/zan_down.png" height="40" width="40">';
                            });
                        }, 
                        error: function(response) {
                            console.log(response);
                        }
                    });
            });
        }
    });

    // hash 路由响应
    $(window).on('hashchange', function(e) {
        e.preventDefault();
        switchUnitNoByHash(true);
    });
    switchUnitNoByHash(false);
    // 获取unitNo hash
    unitNo = getHashUnitNo();
    trackUnitNoView(unitNo);
});


function trackUnitNoView(unitNo) {
    if (!unitNo) {
        unitNo = getHashUnitNo();
    }
    var id = getQueryStringValueByName('id', window.location.href);
    Util.trackDataView({
        id: id,
        unit_no: unitNo,
        type: 'unit', 
    });
}


function getHashUnitNo() {
    var hashParams = Util.parseUrlHash(window.location.hash);
    var unitNo = hashParams ? hashParams['unitNo'] : '';
    if (unitNo) {
        unitNo = decodeURIComponent(unitNo);
    }
    return unitNo;
}


function switchUnitNoByHash(isManual) {
    var hashParams = Util.parseUrlHash(window.location.hash);
    var unitNo = getHashUnitNo();
    if (!viewData) {
        queryData(function() {
            renderPageOnUnitNo(unitNo, isManual);
        });
    } else {
        renderPageOnUnitNo(unitNo, isManual);
    }
}

/**
 * 查询楼盘-户型评价数据?
 */
function queryData(callback){
    // 根据url中的id查询 
    var id = getQueryStringValueByName('id', window.location.href);
    // 查询详情
    $.ajax({
        url: "/api/queryEvaluateUnitDetail",
        data: {id: id},
        dataType: 'json',
        success: function(response){
            viewData = response.data;
            callback();
        }, 
        error: function(response) {
            console.debug(response);
        }
    });
}

function initUnitNoNavIfNot(viewData, unitNo) {
    var navHeader = $(".nav-unit-no");
    if (navHeader.find('li').length > 0) {
        return;
    }

    navHeader.html("");
    var html = "";
    var firstNo = "";
    for (var key in viewData) {
        html +=  "<li><a unit-no='" + key + "'>" + key + "</a></li>";
        if (!firstNo) {
            firstNo = key;
        }
    }
    navHeader.html(html);
    // console.log(navHeader.find("a[unit-no='" + unitNo + "']").parents("li"));
    navHeader.find("a[unit-no='" + unitNo + "']").parents("li").addClass('active');
    // 重新绑定-点击切换户型-响应
    navHeader.find("a").click(function(e) {
        updateNavActiveOnItemClick($(this));
        // 更新hash
        var hashParams = Util.parseUrlHash(window.location.hash);
        if (!hashParams) {
            hashParams = {};
        }
        var unitNo = $(this).attr('unit-no');
        hashParams['unitNo'] = unitNo;
        window.location.hash = Util.toHashString(hashParams);
        // track查看次数
        trackUnitNoView(unitNo);
    });
}


function renderPageOnUnitNo(unitNo) {
    // console.log(viewData);
    var data = null;
    if (viewData) {
        if (!unitNo) {
            unitNo = Object.keys(viewData)[0];
        }
        data = viewData[unitNo];
    }

    var contentView = $(".unit-panels");
    var emptyView = $(".empty-content-info");
    if (!data) {
        toggleShowContent(contentView, emptyView, true);
    } else {
        toggleShowContent(contentView, emptyView, false);
    }

    if (viewData) {
        initUnitNoNavIfNot(viewData, unitNo);
    }
    if (data) {
        renderSynthesis(contentView, data);
        renderBasicInfo(contentView, data);
        renderRoomArea(contentView, data);
        renderRegionFlow(contentView, data);
        renderWindowAndVentilate(contentView, data);
        renderDetail(contentView, data);
    }
}


function renderSynthesis(pageView, data) {
    var classKey = Util.convertToCssClassKey('unit_synthesis');
    var dataKey = 'unit_basic_info';

    var panelView = pageView.find("." + classKey);
    var viewModel = data[dataKey];
    panelView.find('.title').html(viewModel.unit_no);
    
    Util.updateTitleTextByRealEstateName(viewModel);
    panelView.find(".comment").html(viewModel.synthesis_comment ? ('点评：' + viewModel.synthesis_comment) : '');
    var bars = panelView.find(".bars");
    bars.html("");
    
    var keys =  {'unit_basic_info': '1.基本信息', 
        'unit_room_area': '2.面积尺寸', 
        'unit_region_flow': '3.分区流线', 
        'unit_window_ventilate': '4.采光通风', 
        'unit_detail': '5.细节'};
    var totalScore = 0;
    for (var k in keys) {
        var name = keys[k];
        if (data[k] && data[k]['score']) {
            Util.addHBar(bars, {
                label: name,
                value: data[k]['score'] + '分',
                percent: data[k]['score'],
                minWidth: '22%',
            });
            totalScore = totalScore + Number(data[k]['score']);
        }
    }
    if (totalScore > 0) {
        totalScore = totalScore / 5;
    }
    var realTotalScore = viewModel['total_score'];
    if (!realTotalScore) {
        realTotalScore = totalScore;
    } else {
        realTotalScore = Number(realTotalScore);
    }
    realTotalScore = PageRenderer.formatScore(realTotalScore, '分');
    updateScore(panelView, realTotalScore);
}


function renderBasicInfo(pageView, data) {
    var key = 'unit_basic_info';
    var classKey = Util.convertToCssClassKey(key);
    renderCommon(pageView, data, key, classKey);

    var panelView = pageView.find("." + classKey);
    var viewModel = data[key];
    if (!viewModel) {
        viewModel = {};
    }
    var bars = panelView.find(".bars");
    
    var max = Math.max(viewModel.sale_area, viewModel.real_inside_area);
    bars.html("");

    if (viewModel.efficiency) {
        var effValue = Number(viewModel.efficiency);
        var eff = (100 * effValue).toFixed(1);
        var displayEff = eff + '%';
        var level = getLevel('efficiency', effValue);
        var badLevel = getBadLevel('efficiency');
        Util.addHBar(bars, {
            label: '实际得房率',
            value: displayEff,
            percent: 100 * parseFloat(viewModel.efficiency),
            level: level,
            badLevel: badLevel,
        });
    }
    if (viewModel.real_inside_area) {
        Util.addHBar(bars, {
            label: '实际套内面积(方)',
            value: viewModel.real_inside_area,
            percent: 100 * viewModel.real_inside_area / max,
        });
    }
    if (viewModel.sale_area) {
        Util.addHBar(bars, {
            label: '建筑面积(方)',
            value: viewModel.sale_area,
            percent: 100 * viewModel.sale_area / max,
        });
    }
    // 解析赠送面积
    var extraInfoStr = viewModel.extra_info;
    if (extraInfoStr) {
        var extraInfo = JSON.parse(extraInfoStr);
        if (extraInfo) {
            var sendArr = extraInfo['sendAreas'];
            var totalArea = 0; 
            for (var i in sendArr) {
                totalArea = totalArea + Number(sendArr[i].size);
            }
            totalArea = totalArea.toFixed(1);
            Util.addHBar(bars, {
                label: '总增值面积(方)',
                value: totalArea,
                percent: 100 * totalArea / max,
            });
            for (var i in sendArr) {
                Util.addHBar(bars, {
                    label: sendArr[i].name,
                    value: sendArr[i].size,
                    percent: 100 * sendArr[i].size/ max,
                });
            }
        }
    }
    
    var unitConfigStr = "";
    if (viewModel.room_count && viewModel.living_room_count && viewModel.toliet_count) {
        unitConfigStr = viewModel.room_count + '室' + viewModel.living_room_count + '厅' + viewModel.toliet_count + '卫';
    }
    if (unitConfigStr) {
        Util.addHBar(bars, {
            label: '户型配置',
            value: unitConfigStr,
            type: 'plain_value',
        });
    }
    
    
    var widthDepthRatio = Util.formatRatioDisplay(viewModel, 'width', 'depth');
    if (widthDepthRatio) {
        Util.addHBar(bars, {
            label: '户型开进比',
            value: widthDepthRatio,
            type: 'plain_value',
            level: getLevel('unitWidthDepthRatio', widthDepthRatio),
            badLevel: 'D',
        });
    }
    var squareRatio = Util.formatRatioDisplay(viewModel, 'square_perimeter', 'perimeter');
    if (squareRatio) {
        Util.addHBar(bars, {
            label: '户型方正率',
            value: squareRatio,
            type: 'plain_value',
            level: getLevel('unitSquareRatio', squareRatio),
            badLevel: 'D',
        });
    }

    var viewCount = viewModel.view_count;
    if (!viewCount) {
        viewCount = 0;
    }else
    {
        viewCount = (viewCount+num)*4+3;
    }
    document.getElementById("see_count").innerHTML='<font color="#BEBEBE">'+viewCount+'</font>';
}


function renderRoomArea(pageView, data) {
    var key = 'unit_room_area';
    var classKey = Util.convertToCssClassKey(key);
    renderCommon(pageView, data, key, classKey);

    var panelView = pageView.find("." + classKey);
    var viewModel = data[key];
    var basicInfoVM = data['unit_basic_info'];
    if (!viewModel) {
        viewModel = {};
    }
    var barsView = panelView.find(".bars");
    barsView.html("");

    var rooms;
    var extraInfoStr = viewModel.extra_info;
    if (extraInfoStr) {
        var extraInfo = JSON.parse(extraInfoStr);
        if (extraInfo) {
            rooms = extraInfo['rooms'];
        }
    }

    if (rooms) {
        var roomMinWidth = {
            'bed_room': 3,
            'study_room': 2.4,
            'living_room': 3.3,
            'dining_room': 2.1
        }
        var realInsideArea = 0;
        if (data['unit_basic_info'] && data['unit_basic_info'].real_inside_area) {
            realInsideArea = data['unit_basic_info'].real_inside_area;
        }
        var max = 0;
        var barItems = [];
        for (var i in rooms) {
            var room = rooms[i];
            max = Math.max(room.area, max);
        }
        for (var i in rooms) {
            var room = rooms[i];
            var level = '';
            var typeV = Util.UNIT_STANDART[room.room_type];
            for (var j in typeV) {
                if (room.room_type == 'passage') { // 计算面积占比
                    var p = realInsideArea > 0 ? (room.area / realInsideArea) : 0;
                    // console.log(p, room.area, realInsideArea);
                    if (p <= typeV[j]) {
                        level = j;
                        break;
                    }
                } else if (room.room_type == 'storage') {
                    var p = realInsideArea > 0 ? (room.area / realInsideArea) : 0;
                    if (p >= typeV[j]) {
                        level = j;
                        break;
                    }
                } else {
                    if (room.area >= typeV[j]) {
                        level = j;
                        break;
                    }
                }
            }
            var badLevel = getBadLevel(room.room_type);
            var widthDepthRatio = 0;
            var subValue = '';
            // 开进比逻辑
            var ignoreTypes = ['bed_room', 'study_room', 'living_room', 'dining_room', 'living_dining_room'];
            var postfix = '';
            if (ignoreTypes.indexOf(room.room_type) >= 0 && room.depth && room.width) {
                widthDepthRatio = (room.width / room.depth).toFixed(2);
                //if (room.width < roomMinWidth[room.room_type]) {
                    // postfix = " <font style='color:red;margin-left:10px'>开间小于" + roomMinWidth[room.room_type] + '米' + '</font>';
                //}
            }
            if (widthDepthRatio && widthDepthRatio <= 0.7) {
                widthDepthRatio = "<font style='color:red'>" + widthDepthRatio + '</font>';
            }
            var ratioStr = '';
            if (widthDepthRatio) {
                var prefix = '开进比 ';
                if (widthDepthRatio <= 0.7) {
                    ratioStr = prefix + "<font style='color:red'>" + widthDepthRatio + '</font>';
                } else {
                    ratioStr = prefix + widthDepthRatio;
                }
            }
            subValue = ratioStr + postfix;
            // 储藏和走道逻辑
            if (room.room_type == 'storage' || room.room_type == 'passage') {
                var realArea = basicInfoVM['real_inside_area'];
                var areaRatio = 100 * Number(room.area) / Number(realArea);
                areaRatio = areaRatio.toFixed(2);
                subValue = '占比 ' + (areaRatio) + '%';
            }
            // 小于最小开间值时，增加红色提醒文字
            barItems.push({
                label: room.room_name + '(方)',
                subLabel: subValue,
                value: room.area,
                //subValue: subValue,
                percent: 100 * room.area / max,
                level: level,
                badLevel: badLevel,
            });
        }

        for (var i in barItems) {
            var barItem = barItems[i];
            Util.addHBar(barsView, {
                label: barItem.label,
                subLabel: barItem.subLabel,
                value: barItem.value,
                percent: barItem.percent,
                level: barItem.level,
                badLevel: barItem.badLevel,
            });
        }
    }
}

// 分区流线的评价
function renderRegionFlow(pageView, data) {
    var key = 'unit_region_flow';
    var classKey = Util.convertToCssClassKey(key);
    renderCommon(pageView, data, key, classKey);

    var panelView = pageView.find("." + classKey);
    var viewModel = data[key];
    if (!viewModel) {
        viewModel = {};
    }

    var barsView = panelView.find(".bars");
    barsView.html("");

    // 动静分区个数
    if (viewModel['static_region_count'] != null) {
        Util.addHBar(barsView, {
            label: '静区个数',
            value: viewModel['static_region_count'],
            type: 'plain_value',
        });
    }
    if (viewModel['dynamic_region_count'] != null) {
        Util.addHBar(barsView, {
            label: '动区个数',
            value: viewModel['dynamic_region_count'],
            type: 'plain_value',
        });
    }

    var bars = [];
    var distanceStr = viewModel['distances'];
    var distances;
    if (distanceStr) {
        distances = JSON.parse(distanceStr);
    }
    var max = 0;
    for (var i in distances) {
        if (distances[i].k && distances[i].v) {
            max = Math.max(max, Number(distances[i].v));
        }
    }
    for (var i in distances) {
        var item = distances[i];
        var v = item.v;
        if (!v) {
            continue;
        }
        var vv = Number(v);
        var level = getLevel('region_flow', vv, true);
        var badLevel = getBadLevel('region_flow');
        Util.addHBar(barsView, {
            label: item.k,
            value: v,
            percent: 100 * v / max,
            level: level,
            badLevel: badLevel,
        });
    }
}


// 窗户和通风
function renderWindowAndVentilate(pageView, data) {
    var key = 'unit_window_ventilate';
    var classKey = Util.convertToCssClassKey(key);
    renderCommon(pageView, data, key, classKey);

    var panelView = pageView.find("." + classKey);
    var viewModel = data[key];
    if (!viewModel) {
        viewModel = {};
    }

    var extraInfo;
    var extraInfoStr = viewModel['extra_info'];
    if (extraInfoStr) {
        extraInfo = JSON.parse(extraInfoStr);
    }
    
    var barsView = panelView.find(".bars");
    barsView.html("");

    if (extraInfo) {
        var roomWindows = extraInfo['room_windows'];
        var ventilate = extraInfo['ventilate'];

        var bars = [];
        // 实时计算窗深比
        for (var i in roomWindows) {
            var item = roomWindows[i];
            item.ratio = Number(item.window_width) / Number(item.depth);
        }

        var roomOrientCount = {};
        var max = maxValues(roomWindows, 'ratio');
        // console.log(max);
        var badLevel = getBadLevel('window_depth_ratio');
        for (var i in roomWindows) {
            var item = roomWindows[i];
            var ratio = isNaN(item.ratio) ? 0 : item.ratio; 
            var level = getLevel('window_depth_ratio', ratio);
            if (!item.ratio) {
                item.ratio = 0;
            }
            var v = (100 * item.ratio).toFixed(1);
            Util.addHBar(barsView, {
                label: item.room_name +'窗深比',
                value: (v + '%'),
                percent: v / max,
                level: level,
                badLevel: badLevel,
            });
            if (!roomOrientCount[item.orientation]) {
                roomOrientCount[item.orientation] = 1;
            } else {
                roomOrientCount[item.orientation] ++;
            }
        }
        // 展示朝向房间个数
        var orientMap = {
            'south': '南房间数',
            'north': '北房间数',
            'east_west': '东西房间数',
            'middle': '中庭房间数',
            'no': '暗房间数',
        }
        // console.log('roomOrientCount:', roomOrientCount);
        for (var key in roomOrientCount) {
            if (key == 'no') {
                Util.addHBar(barsView, {
                    label: orientMap[key],
                    value: roomOrientCount[key],
                    type: 'plain_value',
                });
            } else {
                Util.addHBar(barsView, {
                    label: orientMap[key],
                    value: roomOrientCount[key],
                    type: 'plain_value',
                });
            }
        }

        // 通风类型
        var ventilateMap = {
            'south_north': {name: '南北通风+侧面通风', level: 'A'},
            'side': {name: '南北通风', level: 'B'},  // side原来表示侧面通风，后来业务修改了 文案改为南北通风，但依然保持side不变
            'middle': {name: '中庭通风', level: 'C'},
            'single_side': {name: '单面通风', level: 'D'},
        }
        var pathMap = {
            '1': '客厅->餐厅',
            '2': '客厅->厨房/卫生间/卧室/书房',
            '3': '卧室->客厅/餐厅',
            '4': '卧室->厨房/卫生间/卧室/书房',
        }
        if (ventilate) {
            var type = ventilate.type;
            var ventilateItem = ventilateMap[type];
            Util.addHBar(barsView, {
                label: '通风类型',
                value: ventilateItem.name,
                type: 'plain_value',
                level: ventilateItem.level,
                badLevel: 'D',
            });
            if (ventilate.paths) {
                for (var i in ventilate.paths) {
                    var index = Number(i) + 1;
                    var pathType = ventilate.paths[i];
                    var pathTypeName = pathMap[pathType];
                    var value = item.convect_type + ',' + item.ventilate_type;
                    Util.addHBar(barsView, {
                        label: '通风路径' + index,
                        value: pathTypeName,
                        type: 'plain_value',
                    });
                }
            }
        }
    }
}


function renderDetail(pageView, data) {
    var key = 'unit_detail';
    var classKey = Util.convertToCssClassKey(key);
    renderCommon(pageView, data, key, classKey);

    var panelView = pageView.find("." + classKey);
    var viewModel = data[key];
    if (!viewModel) {
        viewModel = {};
    }

    var sectionsView = panelView.find('.sections');
    sectionsView.html("");
    var kv = {
        'door': '门厅',
        'living_room': '客厅',
        'dining_room': '餐厅', 
        'bedroom': '卧室,书房', 
        'kitchen': '厨房',
        'toliet': '卫生间',
        'balcony': '阳台', // 文案：'存储室' 修改为  ‘阳台' 
    };

    var index = 0;
    //console.log(viewModel);
    for (var sectionKey in kv) {
        var sectionValue;
        var valueStr = viewModel[sectionKey];
        if (valueStr) {
            sectionValue = JSON.parse(valueStr);
        } else {
            sectionValue = {};
        }

        var section = $($("#detail-section-tpl").html());
        section.find(".section-title").html(kv[sectionKey]);
        // 增加items
        section.find('.sections-items-wrap').html();
        var itemLabels = Util.UNIT_STANDART['detail_items'][sectionKey];
        var count = 0;
        for (var k in itemLabels) {
            index ++;
            var type = Util.UNIT_STANDART['detai_item_key'][k];
            var value = sectionValue[type];
            var itemView = $($('#detail-section-item-tpl').html());
            itemView.find('.name').html(index + '.' + itemLabels[k]);
            if (value) {
                itemView.find('.value').html("<img src='/image/checked.png'></img>");
                itemView.find('.value').removeClass('color-warn');
            } else {
                itemView.find('.value').html("<img src='/image/cross.png'></img>");
                itemView.find('.value').addClass('color-warn');
            }
            section.find('.section-items-wrap').append(itemView);
        }
        sectionsView.append(section);
    }
}


function renderCommon(pageView, data, Key, classKey) {
    var panelView = pageView.find('.' + classKey);
    var viewModel = data[Key];
    if (!viewModel) {
        viewModel = {};
    }

    updateScore(panelView, PageRenderer.formatScore(viewModel.score, '分'));
        
    var imgUrl = viewModel.image_url;
    if (imgUrl == 'undefined') {
        imgUrl = '';
    }
    Util.renderImage(panelView, imgUrl);
    panelView.find(".comment").html(viewModel.comment ? ('点评：' + viewModel.comment) : '');
}

function updateScore(panelView, score) {
    var scoreView = panelView.find(".panel-title .score");
    if (!score) {
        scoreView.hide();
    } else {
        scoreView.html(score).show();
    }
}


function maxValues(arr, key) {
    var max = 0;
    for (var i in arr) {
        // console.log("maxValues:", key, arr[i]);
        if (!isNaN(arr[i][key])) {
            max = Math.max(arr[i][key], max);
        }
    }
    return max;
}

function getLevel(type, value, isReverse) {
    var level = '';
    var typeV = Util.UNIT_STANDART[type];
    for (var j in typeV) {
        var flag;
        if (isReverse) {
            flag = (value < typeV[j]);
        } else {
            flag = (value >= typeV[j]);
        }
        if (flag) {
            level = j;
            break;
        }
    }
    return level;
}


function getBadLevel(type) {
    var levels = Util.UNIT_STANDART[type];
    var len = 0;
    var keys = null;
    if (levels) {
        keys = Object.keys(levels);
        len = keys.length;
    }
    if (len <= 0 || !keys) { // 默认badLevel
        return 'D';
    } else {
        return keys[len - 1];
    }
}


function toggleShowContent(contenView, emptyView, isHideContent) {
    if (isHideContent) {
        emptyView.show();
        contenView.hide();
    } else {
        emptyView.hide();
        contenView.show();
    }
}

