#!/usr/bin/env python

from selenium import webdriver
import requests
import time
import os
import signal



class TimedOutExc(Exception):
    pass

def timeout(timeout):
    def decorated(f):
        def handler(signum, frame):
            raise TimedOutExc()
        def newf(*args, **kwargs):
            old = signal.signal(signal.SIGALRM, handler)
            signal.alarm(timeout)
            try:
                result = f(*args, **kwargs)
            except TimedOutExc:
                return None
            finally:
                signal.signal(signal.SIGALRM, old)
            signal.alarm(0)
            return result
        newf.func_name = f.func_name
        return newf
    return decorated

@timeout(5)
def login(username, password):
    wb = webdriver.Chrome()
    try:
        wb.delete_all_cookies()
        wb.get("http://curriculum.hust.edu.cn/")
        wb.find_element_by_id("loginId").send_keys(username)
        wb.find_element_by_id("upassword").send_keys(password)
        cok = wb.get_cookies()
        rc = {}
        for i in cok:
            rc[i[u'name']] = i[u'value']
        prefix = os.tempnam()
        img = requests.get("http://curriculum.hust.edu.cn/imageensureAction.do", cookies=rc, stream=True).raw.read()
        with open(prefix + '.jpg', 'wb') as f:
            f.write(img)
        os.system("convert " + prefix + ".jpg " + prefix + ".pbm")
        os.system("tesseract " + prefix + ".pbm " + prefix + ".ans")
        with open(prefix + ".ans.txt", 'rb') as f:
            code = f.readline().strip()
        os.system("rm -rf " + prefix + "*")
        wb.find_element_by_id("randnumber").send_keys(code)
        wb.find_element_by_id("login_").click()
        while True:
            if 'student_index.jsp' in wb.current_url:
                break
            if 'Main_index.jsp' in wb.current_url:
                wb.quit()
            time.sleep(1)
    finally:
        return wb


@timeout(10)
def find_classes(wb, username):
    classurl = []
    if not 'student_index.jsp' in wb.current_url:
        raise Exception()
    wb.get("http://curriculum.hust.edu.cn/kc/wspj.jsp")
    curpage = 1
    while True:
        while True:
            try:
                if not wb.find_elements_by_class_name("tableTitleDIV_green"):
                    raise Exception()
                ele = wb.find_element_by_id("num")
                if ele and int(ele.get_attribute("value")) == curpage:
                    break
            except:
                pass
            time.sleep(1)
        page = wb.find_element_by_id("num").get_attribute("value")
        page = int(page)
        wb.execute_script('$("num").value = $("page").value');
        maxpage = int(wb.find_element_by_id("num").get_attribute("value"))
        wb.execute_script('$("num").value = "%d"' % (page));
        xnxq, pjlc = wb.find_element_by_id("wspjPjlc").get_attribute("value").split("|")
        els = wb.find_elements_by_class_name("tableSM")
        for el in els:
            onclick = wb.execute_script("return arguments[0].innerHTML", el)
            #onclick = el.find_element_by_tag_name("div").get_attribute("onclick")
            if 'gotoKcpj' in onclick or 'gotoWspj' in onclick:
                arg = [i.replace('\'', '') for i in onclick.split('(')[1].split(')')[0].split(',')]
                classurl.append("http://curriculum.hust.edu.cn/wspj/awspj.jsp" + "?jsid=%s&kcdm=%s&xnxq=%s&pjlc=%s&page=%d" % (
                    arg[0], arg[1], xnxq, pjlc, page
                ))
        if page == maxpage:
            break
        else:
            curpage += 1
            wb.execute_script("""
loadResourceInfo = function(curpage){
    var xnxq=$("wspjPjlc").value.split("|")[0];
    var pjlc=$("wspjPjlc").value.split("|")[1];
    $("xnxq").value=xnxq;
    Ajax.doPost("../cc_HustWspjTeacherAction.do","hidOption=getWspjToKC&page="+curpage+"&userid=""" +  username + """&xnxq="+xnxq+"&pjlc="+pjlc,function(){
        $("tdList").innerHTML = this.responseText;
        loadPage();
        $("num").value=curpage;
    });
}""")
            wb.execute_script('loadResourceInfo(\'%d\')' % (curpage))
    return classurl


@timeout(120)
def judge_a_class(wb, link, what):
    baselink = link
    while True:
        wb.get(link)
        while True:
            if wb.find_elements_by_class_name("wspj"):
                break
            time.sleep(1)
        wb.execute_script("afterSav = function() { document.write('<input id=\"afterSav\" />') }");
        wb.execute_script("$(\"zbmb\").value = $(\"zbmb_m\").value;")
        nquestion = wb.find_element_by_id("ejzbsize").get_attribute("value")
        commit = ""
        for i in range(int(nquestion)):
            commit += wb.find_element_by_id("ejzb_" + str(i)).get_attribute("value") + ","
            qi = wb.find_element_by_id("pjxx" + str(i))
            radio = qi.find_elements_by_tag_name("input")[what]
            commit += radio.get_attribute('value') + ',' + radio.get_attribute('dj') + '@';
        wb.execute_script("$(\"commit\").value = \"" + commit + "\";")
        cur = wb.find_element_by_id("num").get_attribute("value")
        cur = int(cur)
        max = wb.find_element_by_id("size").get_attribute("value")
        max = int(max)
        wb.execute_script("objForm.save();")
        while True:
            if wb.find_element_by_id("afterSav"):
                break
            time.sleep(1)
        if cur + 1 >= max:
            return
        else:
            link = baselink + "&num=" + str(cur + 1)


@timeout(2)
def close_wb(wb):
    if wb:
        wb.close()

def run_process(username, password, judge):
    wb = None
    try:
        judge = int(judge)
        assert(0 <= judge < 5)
        wb = login(username, password)
        classes = find_classes(wb, username)
        for i in classes:
            judge_a_class(wb, i, int(judge))
    except:
        pass
    close_wb(wb)

if __name__ == "__main__":
    import sys
    username = sys.argv[1]
    password = sys.argv[2]
    run_process(username, password, sys.argv[3])
