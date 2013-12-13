// ==UserScript==
// @name       Auto WSPJ
// @version    0.1
// @description  auto wspj at hust
// @match      http://curriculum.hust.edu.cn/*
// @require        http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.min.js
// @copyright  2012+, Qijiang Fan
// ==/UserScript==



function getpjurl(jsid,kcdm,kcmc,flag){
    var page=$("#num").attr('value');
    var xnxq=$("#wspjPjlc").attr('value').split("|")[0];
    var pjlc=$("#wspjPjlc").attr('value').split("|")[1];
    if(pjlc!=0){
        var url="?jsid="+jsid+"&kcdm="+kcdm+"&xnxq="+xnxq+"&pjlc="+pjlc+"&page="+page;
        url=encodeURI(encodeURI(url));
        return "../wspj/awspj.jsp"+url;
    }else{
        return "javascript:void(0);";
        //alert("\u8bf7\u9009\u62e9\u8bc4\u4ef7\u8f6e\u6b21！");
    }
}

dummypj = function() { return true; }


clickable_count = 0;

judgeall = function(what) {
    $("." + what).each(function(i, v) { 
        $("#tdList").prepend("<iframe src=\"" + v + "\"></iframe");
    });
}


function do_silent_save(){
    if($("#jsid").attr('value')!=""){
        var commit="";
        $("#zbmb").attr('value', $("#zbmb_m").attr('value'));
        for(var i=0;i<$("#ejzbsize").attr('value');i++){
            var ejzb = $("#ejzb_"+i).attr('value');
            commit+=ejzb+",";
            var pjxx="pjxx"+i;
            var obj=document.getElementById(pjxx);
            var divs=obj.getElementsByTagName("input");	
            for(var j=0;j<divs.length;j++){
                if(divs[j].type=='radio'){
                    if(divs[j].checked==true){
                        commit+=divs[j].value+","+divs[j].getAttribute("dj")+"@";		
                    }			
                }
            }
        }
        if(commit.split("@").length-1!=$("#ejzbsize").attr('value')){
            //  alert("回答不完整，请检查后再提交!");
        }else{
            $("#commit").attr('value', commit);
            objForm.save();
        }
    }else{
        // alert("请选择一位需要评价的老师!");
    }
}

function wait_on_list_page() {
    if (window.location.pathname.indexOf("kc/wspj.jsp") == -1) return;
    if ($("#tdList").html().indexOf("gotoWspj") >= 1  || $("#tdList").html().indexOf("gotoKcpj") >= 1 || $("#tdList").html().indexOf("gotoCkpj") >= 1) {
        
        if ($("#tdList").html().indexOf("全自動評價本頁") == -1)
            $("#tdList").prepend("<span style=\"font-size: 30px;\">以下只會評價未評完的課程（已評完的課程不會修改）</span><br/><a style=\"font-size: 20px; \" href=\"javascript:judgeall('jty');\">本頁全特優</a>|" + 
                                 "<a style=\"font-size: 20px; \" href=\"javascript:judgeall('jy');\">本頁全優</a>|" + 
                                 "<a style=\"font-size: 20px; \" href=\"javascript:judgeall('jl');\">本頁全良</a>|" +
                                 "<a style=\"font-size: 20px; \" href=\"javascript:judgeall('jyb');\">本頁全一般</a>|" +
                                 "<a style=\"font-size: 20px; \" href=\"javascript:judgeall('jc');\">本頁全差</a>|");
        $("div").each(function(i, val) { 
            
            if (val.outerHTML.indexOf("gotoKcpj") >= 1) {
                var s = val.outerHTML.split('(')[1].split(')')[0].split(',');
                for (var i = 0; i < s.length; i++) s[i] = s[i].replace("'", "").replace("'", "");
                var pjurl = getpjurl(s[0], s[1], s[2], s[3]);
                val.innerHTML = val.innerHTML.replace("javascript:void(0)", pjurl) +
                    "<a class=\"jty\" href=" + pjurl + "&auto=1>自動特優</a>|<a class=\"jy\" href=" + pjurl + "&auto=2>自動優</a>|<a class=\"jl\" href=" + pjurl + "&auto=3>自動良</a>|<a class=\"jyb\" href=" + pjurl + "&auto=4>自動一般</a>|<a class=\"jc\" href=" + pjurl + "&auto=5>自動差</a>";
                val.outerHTML = val.outerHTML.replace("gotoKcpj", "dummypj");
            }
            if (val.outerHTML.indexOf("gotoWspj") >= 1) {
                var s = val.outerHTML.split('(')[1].split(')')[0].split(',');
                for (var i = 0; i < s.length; i++) s[i] = s[i].replace("'", "").replace("'", "");
                var pjurl = getpjurl(s[0], s[1], s[2], s[3]);
                val.innerHTML = val.innerHTML.replace("javascript:void(0)", pjurl) +
                    "<a class=\"jty\" href=" + pjurl + "&auto=1>自動特優</a>|<a class=\"jy\" href=" + pjurl + "&auto=2>自動優</a>|<a class=\"jl\" href=" + pjurl + "&auto=3>自動良</a>|<a class=\"jyb\" href=" + pjurl + "&auto=4>自動一般</a>|<a class=\"jc\" href=" + pjurl + "&auto=5>自動差</a>";
                val.outerHTML = val.outerHTML.replace("gotoWspj", "dummypj");
            }
            if (val.outerHTML.indexOf("gotoCkpj") >= 1) {
                var s = val.outerHTML.split('(')[1].split(')')[0].split(',');
                for (var i = 0; i < s.length; i++) s[i] = s[i].replace("'", "").replace("'", "");
                var pjurl = getpjurl(s[0], s[1], s[2], s[3]);
                val.innerHTML = "<a href=\"javascript:void(0);\" onclick=\"window.open('" + pjurl + "');\">查看</a><br/>修改: " + 
                    "<a href=" + pjurl + "&auto=1>自動特優</a>|<a href=" + pjurl + "&auto=2>自動優</a>|<a href=" + pjurl + "&auto=3>自動良</a>|<a href=" + pjurl + "&auto=4>自動一般</a>|<a href=" + pjurl + "&auto=5>自動差</a>";
                val.outerHTML = val.outerHTML.replace("gotoCkpj", "dummypj");
            }
        });
    }
    setTimeout(wait_on_list_page, '100');
}

function wait_on_judge_list() {
    if (window.location.pathname.indexOf("awspj") == -1) return;
    if (window.location.href.indexOf("auto=") >= 1) {
        if ($("#tdList").html().indexOf("grade") >= 1) {     
            unsafeWindow.afterSav = function() { 
                var baseurl = window.location.href.substring(0, window.location.href.indexOf("auto=") + 6);
                var curindex = parseInt($("#num").attr('value'));
                var maxindex = parseInt($("#size").attr('value'));
                console.log(baseurl);
                if (curindex + 1 >= maxindex) {
                    if (window.self == window.top) window.location.href = "http://curriculum.hust.edu.cn/kc/wspj.jsp";
                    else
                        document.write("This one is finished");
                }
                else
                    window.location.href = baseurl + "&num=" + (curindex + 1);
            }
            var scoreloc = window.location.href.indexOf("auto");
            var score = window.location.href[scoreloc + 5];
            $("input[dj=0" + score + "]").attr("checked", "checked");
            do_silent_save();
        }
        else {
            setTimeout(wait_on_judge_list, '100');
        }
    }
}

setTimeout(wait_on_list_page, '100');
setTimeout(wait_on_judge_list, '100');

$(".buttonDivRight").each(function(i, val) {
    if (i == 0) {
        val.innerHTML = val.innerHTML.replace("return DoSubmit(this);", "javascript:history.back();");
    }
});