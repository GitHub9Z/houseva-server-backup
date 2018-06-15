function updateNavActiveOnItemClick(e){var t=e.closest("li");t.siblings().removeClass("active"),t.addClass("active")}var PageRenderer={};function toast(e){$(".root-body .toast").remove(),$(".root-body").append("<div class='toast'>"+e+"</div>"),$(".toast").stop().fadeIn(400).delay(3e3).fadeOut(400)}function commonHandleResponse(e,t,n){e.success?t(e):(toast(e.resultView),null!=n&&n(e))}function storageGet(e){if(window.localStorage)return window.localStorage.getItem(e)}function storageSet(e,t){if(window.localStorage)return window.localStorage.setItem(e,t)}function geSitePlanBuildingAvgLightHour(e){return parseExtraInfoKey(e,"buildingAvgLightHour")}function parseExtraInfoKey(e,t){var n=e.extra_info;if(n){var i=JSON.parse(n);if(i&&i[t])return i[t]}return null}function findMaxValueOfArray(e,t){var n=0;return e.forEach(function(e){n=Math.max(n,parseFloat(e[t]))}),n}function calcLightHourLevel(e){var t=parseFloat(e);return t>=6?"A":t>=4?"B":t>=2?"C":"D"}function maxStandartLightHours(e){return Math.max(8,findMaxValueOfArray(e,"hours"))}function getQueryStringValueByName(e,t){t||(t=window.location.href),e=e.replace(/[\[\]]/g,"\\$&");var n=new RegExp("[?&]"+e+"(=([^&#]*)|&|#|$)").exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null}PageRenderer.renderEvaluateList=function(e,t){var n=$("#list-item-tpl").html(),i=e.find(".list"),r="";i.html("");for(var a=0;a<t.length;a++){t[a];r+=n}i.html(r),t.forEach(function(e,t){var n=$(i.find(".list-item")[t]);"lightSitePlan"in e?PageRenderer.renderRealEstateItem(n,e):"unit_no"in e?PageRenderer.renderUnitItem(n,e):PageRenderer.renderRealEstateItem(n,e)})},PageRenderer.renderRealEstateItem=function(e,t){var n="/detail.html?id="+t._id,i=e;i.find(".title a").html(t.name).attr("href",n),i.click(function(){window.location.href=n}),i.find(".image-wrap").click(function(e){window.location.href=n});var r=i.find(".score"),a="",o="",l=t.lightSitePlan;if(l){var c=l.thumbnail_light_image_url?l.thumbnail_light_image_url:l.light_image_url;c&&i.find(".image-box img").attr("src",c);var u="",d=geSitePlanBuildingAvgLightHour(l);d&&d.forEach(function(e,t){t<1&&(u+=e.buildingNo+"号楼 "+e.hours+"小时<br/>")}),o=u,l.score&&(a=l.score)}o||(o="无"),o&&i.find(".mid-text").html(o),i.find(".score-desc").html("日照得分"),a=PageRenderer.formatScore(a),r.html(a);var f=0;t.lightSitePlan&&t.lightSitePlan.view_count&&(f=t.lightSitePlan.view_count),i.find(".view-info").html(f+"次查看")},PageRenderer.renderUnitItem=function(e,t){var n=function(e,t){return e&&e>0?e+t:"0"+t},i="/detailUnit.html?id="+t.real_estate_id+"#unitNo="+t.unit_no,r=e,a=t.unit_no+"<font class='title-postfix'>"+t.real_estate_name+"</font>";r.find(".title a").html(a).attr("href",i),r.click(function(){window.location.href=i}),r.find(".image-wrap").click(function(e){window.location.href=i});var o=r.find(".score"),l=t.total_score?t.total_score:t.score,c=n(t.room_count,"室")+n(t.living_room_count,"厅")+n(t.toliet_count,"卫");r.find(".mid-text").html(c);var u=t.thumbnail_image_url?t.thumbnail_image_url:t.image_url;u&&r.find(".image-box img").attr("src",u),l=PageRenderer.formatScore(l),o.html(l),r.find(".score-desc").html("户型得分");var d=t.view_count;d||(d=0),r.find(".view-info").html(d+"次查看")},PageRenderer.formatScore=function(e,t){return e?(t||(t=""),e=Number(e),isNaN(e)||(e=e.toFixed(1)+t)):e="无",e},PageRenderer.initTitleBar=function(e){$(".title-bar .action-return").click(function(e){window.location.href="/index.html"}),$(".title-bar .logo").click(function(e){window.location.href="/index.html"}),(!e||e.jumpSearch)&&$(".search-input").click(function(e){window.location.href="/search.html"})};