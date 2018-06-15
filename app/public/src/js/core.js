////////////////////////////////////////////////////////
//
// 前端 核心js 模块
//
////////////////////////////////////////////////////////


////////////////////////////////////////////////////////
// view 相关
////////////////////////////////////////////////////////
/**
 * bootstrap 经典nav>li>a 的点击active 更新
 * @param {*} itemView 
 */
function updateNavActiveOnItemClick(itemView) {
    var li = itemView.closest('li');
    li.siblings().removeClass("active");
    li.addClass("active");
}


/**
 * 页面渲染器
 */
var PageRenderer = {
    // ignore
}


/**
 * 渲染评测列表
 */
PageRenderer.renderEvaluateList = function(listViewWrap, list) {
    var evaluateItemHtml = $("#list-item-tpl").html();
    var listView = listViewWrap.find(".list");
    var html = "";
    listView.html('');
    for (var i = 0; i < list.length; i++) {
        var item = list[i];
        html += evaluateItemHtml;
    }
    listView.html(html);
    // console.log();
    list.forEach(function(item, index) {
        var itemView = $(listView.find(".list-item")[index]);
        if ('lightSitePlan' in item) {
            PageRenderer.renderRealEstateItem(itemView, item);
        } else if ('unit_no' in item) {
            PageRenderer.renderUnitItem(itemView, item);
        } else {
            PageRenderer.renderRealEstateItem(itemView, item);
        }
    });
}


PageRenderer.renderRealEstateItem = function(itemView, item) {
    var linkUrl = '/detail.html?id=' + item._id;
    var view = itemView;
    view.find('.title a').html(item.name).attr('href', linkUrl);
    view.click(function() {
        window.location.href = linkUrl;
    });

    view.find(".image-wrap").click(function(e){
        window.location.href = linkUrl;
    });

    var scoreView = view.find(".score");
    var scoreText = "";
    // 总图光照分析
    var displaySitePlan = "";
    var showLightSitePlan = false;
    var lightSitePlan = item.lightSitePlan;
    if (lightSitePlan) {
        var displayImgUrl = lightSitePlan.thumbnail_light_image_url ?  lightSitePlan.thumbnail_light_image_url : 
            lightSitePlan.light_image_url;
        if (displayImgUrl) {
            view.find(".image-box img").attr('src', displayImgUrl);
        }  
        // 展示楼栋平均日照时长
        var displayStr = "";
        var hours = geSitePlanBuildingAvgLightHour(lightSitePlan);
        if (hours) {
            hours.forEach(function(item, index) {
                if (index < 1) {
                    displayStr += item.buildingNo + "号楼 " + item.hours + "小时<br/>";
                }
            });
        }
        displaySitePlan = displayStr;
        if (lightSitePlan.score) {
            scoreText = lightSitePlan.score;
        }  
    }

    if (!displaySitePlan) {
        displaySitePlan = "无";
    }  
    if (displaySitePlan) {
        view.find(".mid-text").html(displaySitePlan);
    }

    view.find('.score-desc').html('日照得分');
    scoreText = PageRenderer.formatScore(scoreText);
    scoreView.html(scoreText);
    var viewCount = 0;
    if (item.lightSitePlan && item.lightSitePlan.view_count) {
        viewCount = item.lightSitePlan.view_count;
    }
    view.find(".view-info").html(viewCount + "次查看");
}


PageRenderer.renderUnitItem = function(itemView, item) {
    var countDisplayer = function(v, unit) {
        if (v && v > 0) {
            return v + unit;
        } else {
            return '0' + unit;
        }
    }

    var linkUrl = '/detailUnit.html?id=' + item.real_estate_id + '#unitNo=' + item.unit_no;
    var view = itemView;
    var titleStr = item.unit_no + "<font class='title-postfix'>" + item.real_estate_name + '</font>';
    view.find('.title a').html(titleStr).attr('href', linkUrl);
    view.click(function() {
        window.location.href = linkUrl;
    });

    view.find(".image-wrap").click(function(e){
        window.location.href = linkUrl;
    });
    var scoreView = view.find(".score");
    var scoreText = item.total_score ? item.total_score : item.score;
    // 次级文案
    var roomCountStr = countDisplayer(item.room_count, '室') + countDisplayer(item.living_room_count, '厅') +
        countDisplayer(item.toliet_count, '卫'); 
    var subText = roomCountStr;
    view.find(".mid-text").html(subText);
    // 图片渲染
    var displayImgUrl = item.thumbnail_image_url ?  item.thumbnail_image_url : 
        item.image_url;
    if (displayImgUrl) {
        view.find(".image-box img").attr('src', displayImgUrl);
    }  
     
    scoreText = PageRenderer.formatScore(scoreText);
    scoreView.html(scoreText);
    view.find('.score-desc').html('户型得分');

    var viewCount = item.view_count;
    if (!viewCount) {
        viewCount = 0;
    }
    view.find(".view-info").html(viewCount + "次查看");
}


PageRenderer.formatScore = function(score, unit) {
    if (!score) {
        score = "无";
    } else {
        if (!unit) {
            unit = '';
        }
        score = Number(score);
        if (!isNaN(score)) {
            score = score.toFixed(1) + unit;
        }
    } 
    return score;
}


PageRenderer.initTitleBar = function(options) {
    // TODO 返回按钮
    $(".title-bar .action-return").click(function(e) {
        //history.go(-1);
        //history.back();
        window.location.href = '/index.html';
    });

    $(".title-bar .logo").click(function(e) {
        window.location.href = '/index.html';
    });

    var jumpSearch = !options || (options.jumpSearch);
    // 初始化页面响应逻辑（搜索页面不需要!)
    if (jumpSearch) {
        $(".search-input").click(function(e) {
            // 点击搜索 跳转到搜索页面
            window.location.href = '/search.html';
        });
    }
}


/**
 * toast 
 */
function toast(str) {
    $('.root-body .toast').remove();

    $('.root-body').append("<div class='toast'>" + str + "</div>");
    $('.toast').stop().fadeIn(400).delay(3000).fadeOut(400);
}
 

/**
 * API通用响应逻辑处理
 * @param {*} name 
 * @param {*} url 
 */
function commonHandleResponse(resp, successCallback, failCallback) {
    if (resp.success) {
        successCallback(resp);
    } else {
        // common fail
        toast(resp.resultView);
        if (failCallback != null) {
            failCallback(resp);
        }
    }
}


function storageGet(key){
    if (window.localStorage) {
        return window.localStorage.getItem(key);
    } else {

    }
}


function storageSet(key, v) {
    if (window.localStorage) {
        return window.localStorage.setItem(key, v);
    } else {
        
    }
}

////////////////////////////////////////////////////////
// 业务数据操作相关
////////////////////////////////////////////////////////
/**
 * 获取总图楼栋平均日照时间
 */
function geSitePlanBuildingAvgLightHour(lightSitePlanData) {
    return parseExtraInfoKey(lightSitePlanData, 'buildingAvgLightHour');
}


function parseExtraInfoKey(data, key) {
    var extraInfoJson = data.extra_info;
    if (extraInfoJson) {
        var extraInfo = JSON.parse(extraInfoJson);
        if (extraInfo && extraInfo[key]) {  
            return extraInfo[key];
        }   
    }
    return null;
}


function findMaxValueOfArray(array, key) {
    var max = 0;
    array.forEach(function(item) {
        max = Math.max(max, parseFloat(item[key]));
    });
    return max;
}


/**
 * 返回光照时长级别
 * 目前定义为4个级别：Level=A/B/C/D, D最差, 光照<2小时为D, level=A最好
 * @param hourStr 
 */
function calcLightHourLevel(hourStr) {
    var hour = parseFloat(hourStr);
    var result = 'D';
    if (hour >= 6) {
        result = 'A';
    } else if (hour >= 4) {
        result = 'B';
    } else if (hour >= 2) {
        result = 'C';
    } else {
        result = 'D';
    }
    return result;
}


/**
 * 最大的标准日照时间(以8为baseline hour)
 * @param  array 
 */
function maxStandartLightHours(array) {
    return Math.max(8, findMaxValueOfArray(array, 'hours'));
}



////////////////////////////////////////////////////////
// url操作相关
////////////////////////////////////////////////////////
function getQueryStringValueByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
