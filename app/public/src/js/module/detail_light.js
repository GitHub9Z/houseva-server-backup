////////////////////////////////////////////////////////
//
// 详情-日照 js 
//
////////////////////////////////////////////////////////
 
var viewData = null;

$(function() {      
    PageRenderer.initTitleBar(); 
    var id = getQueryStringValueByName('id', window.location.href);

    // 户型/日照 切换
    $(".tab-header .unit a").on("click", function(){
        location.href = "/detailUnit.html?id=" + id;
    });

    // 日照类型tab 切换
    $(".nav-sub a").on("click", function(){
        // 更新样式
        updateNavActiveOnItemClick($(this));
        // 更新hash
        var hashParams = Util.parseUrlHash(window.location.hash);
        if (!hashParams) {
            hashParams = {};
        }
        hashParams['type'] = $(this).attr("type");
        window.location.hash = Util.toHashString(hashParams);
    });
    // hash 路由响应
    $(window).on('hashchange', function(e) {
        e.preventDefault();
        switchTabByHash(true);
    });

    switchTabByHash(false);

    Util.trackDataView({
        id: id,
        type: 'light', 
    });
});


function getHourDisplay(item, prefix) {
    var minKey = prefix ? prefix + '_min' : 'hours_min';
    var maxKey = prefix ? prefix + '_max' : 'hours_max';
    var avgKey = prefix ? prefix : 'hours';
    if (item[minKey] && item[maxKey] && item[minKey] != item[maxKey]) {
        return item[minKey] + '-' + item[maxKey];
    } else {
        return item[avgKey];
    }
}

function switchTabByHash(isManual) {
    var hashParams = Util.parseUrlHash(window.location.hash);
    var type = hashParams ? hashParams['type'] : '';
    if (!type) {
        type = 'sitePlan';
    }
    switchLightType(type, isManual);
}


function switchLightType(type, isManual) {
    if (type && !isManual) {
        $(".nav-sub a[type='" + type + "']").closest("li").addClass("active");
    }
    // 隐藏其它界面?
    jQuery.each($(".tab-body-light .tab-page"), function(index, itemView) {
        if (type == $(itemView).attr('type')) {
            $(itemView).show();
        } else {
            $(itemView).hide();
        }
    });
    onTabChanged(type);
}


function onTabChanged(type){
    if (!viewData){
        queryData(type);
    } else {
        renderTabPage(viewData, type);
    }
}

function queryData(type){
    // 根据url中的id查询 
    var id = getQueryStringValueByName('id', window.location.href);
    // 查询详情
    $.ajax({
        url: "/api/queryEvaluateLightDetail",
        data: {id: id},
        dataType: 'json',
        success: function(response){
            viewData = response.data;
            renderTabPage(viewData, type);
            Util.updateTitleTextBySitePlanData(response.data);
        }, 
        error: function(response) {
            console.log("response: ", response);
        }
    });
}

function renderTabPage(data, type) {
    var regionView = $(".tab-page[type='" + type + "']");
    var updateDisplay = regionView.attr('updateDisplay');
    // re render tab page
    if (type == 'sitePlan') {
        renderSitePlan(viewData, regionView);
    } else if (type == 'elevationPlan') { // 楼栋采光
        renderElevationPlanPage(viewData, regionView);
    } else if (type == 'floor') {
        renderFloorPage(viewData, regionView);
    }

    showViewCount(data);
}


/**
 * 渲染总图View
*/
function renderSitePlan(data, tabPageView) {
    var lightSitePlan = data ? data.lightSitePlan : null;
    var hasHourBar = false;
    if (lightSitePlan) {
        // 平均日照时长
        var hours = geSitePlanBuildingAvgLightHour(lightSitePlan);
        if (hours) {
            var viewContainer = tabPageView.find(".building-avg-hours");
            viewContainer.html("");
            var hoursStr = "";
            var maxHours = maxStandartLightHours(hours);
            hours.forEach(function(item) {
                var hourDisplay = getHourDisplay(item);
                Util.addHBar(viewContainer, {
                    label: item.buildingNo + '栋(h)',
                    value: hourDisplay,
                    percent: 100 * item.hours / maxHours,
                    level: calcLightHourLevel(item.hours)
                });
            });
            hasHourBar = true;
        }
        // 评价
        if (lightSitePlan.comment) {
            Util.renderComment(tabPageView, lightSitePlan.comment);
        }
        // 日照图
        if (lightSitePlan.light_image_url){
            tabPageView.find(".image-static-box img").attr("src", lightSitePlan.light_image_url);
            tabPageView.find(".number-box").show();
        } else {
            tabPageView.find(".number-box").hide();
        }
        if (lightSitePlan.effect_image_url) {
            tabPageView.find(".image-effect-box img").attr("src", lightSitePlan.effect_image_url);
        }
    }
    // console.log(lightSitePlan);
    toggleShowDetail(tabPageView, getEmptyView(), !lightSitePlan);
}

function getEmptyView() {
    return $(".empty-content-info");
}

/**
 * 渲染立面日照
*/
function renderElevationPlanPage(data, tabPageView, buildingNo) {
    var list = data ? data.lightElevationPlans : null;
    var hasList = list && list.length > 0;
    toggleShowDetail(tabPageView, getEmptyView(), !hasList);
    
    if (!hasList) {
        return;
    }
    // 楼栋编号选择导航条
    var buildingNoHeader = tabPageView.find(".building-no-nav");
    var html = "";
    if (!buildingNoHeader.html()) {
        for (var i in list) {
            var item = list[i];
            html +=  "<li><a building-no='" + item.building_no + "'>" + item.building_no + "#</a></li>";
        }
        buildingNoHeader.html(html);
    }
    // 如未指定楼栋号，则默认取第一个数据
    if (!buildingNo) {
        buildingNo = list[0].building_no;
    }
    // 重新绑定-点击切换楼栋事件响应
    buildingNoHeader.find("a").click(function(e) {
        updateNavActiveOnItemClick($(this));
        renderBuildingLight(list, tabPageView, $(this).attr('building-no'));
    });

    var aLinks = buildingNoHeader.find("a");
    for (var i in aLinks) {
        if ($(aLinks[i]).attr("building-no") == buildingNo) {
            $(aLinks[i]).click();
            break;
        }
    }
    tabPageView.attr("updateDisplay", false);
}


function renderBuildingLight(list, tabPageView, buildingNo) {
    var itemData = null;
    for (var i in list){
        if (list[i].building_no == buildingNo){
            itemData = list[i];
            break;
        }
    }
    var viewParent = tabPageView.find(".elevation-plan-page");
    var isNotValideData = !isValidElevationItemData(itemData);
    toggleShowDetail(viewParent, getEmptyView(), isNotValideData);
    if (isNotValideData) {
        return;
    }

    // 朝向
    var headBox = viewParent.find(".head-box");
    if (itemData.building_angel) {
        headBox.html("<div>朝向：" + itemData.building_angel + "度</div>");
    } else {
        headBox.html("");
    }
    var lightDescView = viewParent.find(".desc-sub");
    // 楼层平均光照
    var viewContainer = viewParent.find(".hours-box");
    viewContainer.html("");
    var floorLightInfo = parseExtraInfoKey(itemData, 'floor_light_info');
    if (floorLightInfo) {
        var hoursStr = "";
        var maxHours = maxStandartLightHours(floorLightInfo);
        floorLightInfo.forEach(function(item) {
            var label = "";
            if (item.floorStart == item.floorEnd) {
                label = item.floorStart + '层(h)';
            } else {
                label = item.floorStart + '-' + item.floorEnd + '层(h)';
            }
            var percent = 100 * parseFloat(item.hours) / maxHours;
            var hourDisplay = getHourDisplay(item);
            // console.log(percent);
            Util.addHBar(viewContainer, {
                label: label,
                value: hourDisplay,
                subValue: item.comment,
                percent: percent,
                level: calcLightHourLevel(item.hours),
                minWidth: '120px',
            });
        });
        lightDescView.show();
    } else {
        lightDescView.hide(); 
    }
    // 评价
    Util.renderComment(viewParent, itemData.comment);
    renderImage(viewParent, itemData.light_image_url);
}


/**
 * 渲染楼层日照
*/
function renderFloorPage(data, tabPageView, buildingNo) {
    var list = data ? data.lightFloors : null;
    var hasList = list && list.length > 0;
    toggleShowDetail(tabPageView, getEmptyView(), !hasList);
    if (!hasList) {
        return;
    }

    // 楼栋编号选择导航条
    var buildingNoHeader = tabPageView.find(".building-no-nav");
    var group = Util.groupArrayByKey(list, 'building_no');
    
    buildingNoHeader.html("");
    var html = "";
    var firstBuildingNo = "";
    for (var i in group) {
        var item = group[i];
        html +=  "<li><a building-no='" + i + "'>" + i + "栋</a></li>";
        if (!firstBuildingNo) {
            firstBuildingNo = i;
        }
    }
    buildingNoHeader.html(html);
    // 如未指定楼栋号，则默认取第一个数据
    if (!buildingNo) {
        buildingNo = firstBuildingNo;
    }
    // 重新绑定-点击切换楼栋事件响应
    buildingNoHeader.find("a").click(function(e) {
        updateNavActiveOnItemClick($(this));
        var buildingNo = $(this).attr('building-no');
        renderFloorPageOnBuilding(group[buildingNo], tabPageView, buildingNo);
    });

    var aLinks = buildingNoHeader.find("a");
    for (var i in aLinks) {
        if ($(aLinks[i]).attr("building-no") == buildingNo) {
            $(aLinks[i]).click();
            break;
        }
    }
}

function renderFloorPageOnBuilding(list, tabPageView, buildingNo) {
    var viewParent = tabPageView.find(".floor-page");
    var emptyView = tabPageView.find(".empty-content-info");
    var itemData = null;

    var floorNoHeader = tabPageView.find(".floor-no-nav");
    floorNoHeader.html("");
    var html = "";
    var firstFloorNo = "";
    for (var i in list) {
        var item = list[i];
        var floorNo = item['floor_no'];
        html +=  "<li><a floor-no='" + floorNo + "'>" + floorNo + "层</a></li>";
        if (!firstFloorNo) {
            firstFloorNo = floorNo;
        }
    }

    floorNoHeader.html(html);
    // // 重新绑定-点击切换楼栋事件响应
    floorNoHeader.find("a").click(function(e) {
        updateNavActiveOnItemClick($(this));
        var floorNo = $(this).attr('floor-no');
        renderFloorPageOnFloor(list, tabPageView, buildingNo, floorNo);
    });
    var aLinks = floorNoHeader.find("a");
    if (firstFloorNo) {
        floorNoHeader.find("a[floor-no='" + firstFloorNo + "']").click();
    }
}


function renderFloorPageOnFloor(list, tabPageView, buildingNo, floorNo) {
    var viewParent = tabPageView.find(".floor-page");
    var itemData = null;
    if (list && list.length > 0) {
        if (!floorNo) {
            floorNo = list[0].floor_no;
            itemData = list[0];
        } else {
            for (var i in list){
                if (list[i].floor_no == floorNo){
                    itemData = list[i];
                    break;
                }
            }
        }
    }

    var isNotValideData = !isValidFloorItemData(itemData);
    toggleShowDetail(viewParent, getEmptyView(), isNotValideData);
    if (isNotValideData) {
        return;
    }   
    
    // 楼层三个朝向的光照
    var viewContainer = viewParent.find(".hours-box");
    viewContainer.html("");
    var hoursMap = parseExtraInfoKey(itemData, 'direction_hours');
    if (hoursMap && hoursMap.south_hours && hoursMap.east_hours && hoursMap.west_hours) {
        var maxHours = maxFloorDirectionHours(hoursMap);
        var keys = ['south_hours', 'east_hours', 'west_hours'];
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var label = getDirectionLabel(key);;
            var hours = hoursMap[key];
            var hoursDisplay = getHourDisplay(hoursMap, key);
            var percent = 100 * parseFloat(hours) / maxHours;
            Util.addHBar(viewContainer, {
                label: label,
                value: hoursDisplay,
                subValue: '',
                percent: percent,
                level: calcLightHourLevel(hours),
                minWidth: '120px',
            });
        }
    }  
    // 评价
    Util.renderComment(viewParent, itemData.comment);
    renderImage(viewParent, itemData.light_image_url);
}

function renderImage(viewParent, imgUrl) {
    if (imgUrl){
        viewParent.find(".image-box img").attr("src", imgUrl);
        viewParent.find(".number-box").show();
    } else {
        viewParent.find(".image-box img").attr("src", "");
        viewParent.find(".number-box").hide();
    }
}

function maxFloorDirectionHours(map) {
    var max = 0;
    for (var key in map) {
        max = Math.max(max, parseFloat(map[key]));
    }
    max = Math.max(8, max);
    return max;
}

function getDirectionLabel(key) {
    if (key == 'south_hours') {
        return "南面(h)";
    } else if (key == 'east_hours') {
        return "东面(h)";
    } else if (key == 'west_hours') {
        return "西面(h)";
    }
}

function isValidElevationItemData(itemData) {
    if (!itemData || (!itemData.light_image_url && !itemData.extra_info && !itemData.comment)) {
        return false;
    } else {
        return true;
    }
}

function isValidFloorItemData(itemData) {
    if (!itemData || (!itemData.light_image_url && !itemData.comment)) {
        return false;
    } else {
        return true;
    }
}

function toggleShowDetail(contenView, emptyView, isHideDetail) {
    if (isHideDetail) {
        emptyView.show();
        contenView.hide();
    } else {
        emptyView.hide();
        contenView.show();
    }
    toggleShowBottomDesc(isHideDetail);
}

function toggleShowBottomDesc(isHide) {
    // 共用的等级说明页面
    var bottomDescView = $(".bottom-desc-box");
    if (isHide) {
        bottomDescView.hide();
    } else {
        bottomDescView.show();
    }
}

function showViewCount(data) {
    var viewCount = "";
    if (data && data.lightSitePlan) {
        var lightSitePlan = data.lightSitePlan;
        var viewCount = lightSitePlan.view_count;
        if (!viewCount) {
            viewCount = 0;
        }
    }

    if (viewCount == '') {
        viewCount = 0;
    }

    var view = $(".view-count-box .view-count");
    view.html(viewCount);
}

