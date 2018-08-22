
var calendar = (function (api) {
    // 增加日期格式化
    Date.prototype.format = function (format) {
        var o = {
            "M+": this.getMonth() + 1, // month
            "d+": this.getDate(), // day
            "h+": this.getHours(), // hour
            "m+": this.getMinutes(), // minute
            "s+": this.getSeconds(), // second
            "q+": Math.floor((this.getMonth() + 3) / 3), // quarter
            "S": this.getMilliseconds() // millisecond
        }
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1,
                    RegExp.$1.length == 1 ? o[k] :
                        ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    }

    // 判断二月是不是闰月
    // 如果当前年份能被4整除但是不能被100整除或者能被400整除，即可确定为闰年，返回1，否则返回0
    function isLeap(year) {
        var flag = year % 4 == 0 ? true : false;
        var flag2 = (year % 100 != 0) || (year % 400 == 0);
        return (flag && flag2) ? 1 : 0;
    }

    var today = new Date(); // 当前日期
    var daysPerMonth; // 每月的天数数组
    var col = 7,
        row = 6; // 每周7天，6行
    var selectedYear; // 选择的年份
    var selectedMonth; // 选择的月份
    var selectedDay; // 选择的日子

    // 星期
    var dayStrs = ["日", "一", "二", "三", "四", "五", "六"];
    var monthStrs = []; // 月份
    var yearStrs = []; // 年份
    // 内容日期数据列表
    var list = [];
    var target;
    function init() {
        target = api.getTarget();
        var year = today.getFullYear(); // 日期中的年份
        var month = today.getMonth(); // 日期中的月份(月份是从0开始计算，获取的值比正常月份的值少1)
        var day = today.getDate(); // 日期中的日
        selectedYear = year;
        selectedMonth = month;
        selectedDay = day;

        console.log("today: " + today + " year: " + year + " month: " + month + " day: " + day);
        // 今天
        updateInfo(year, month, day);

        // 构建年月份的列表数据
        for (var i = 0; i < 12; i++) {
            monthStrs.push([
                (i + 1) + "月", i
            ]);
        }
        for (var y = 1900; y <= 2050; y++) {
            yearStrs.push([
                y + "年", y
            ]);
        }
        // console.log("years:", JSON.stringify(yearStrs));
        // console.log("months:", JSON.stringify(monthStrs));

        var choseYearUI = api.get("选择年份");
        choseYearUI.options = yearStrs;
        var choseMonthUI = api.get("选择月份");
        choseMonthUI.options = monthStrs;
        choseYearUI.value = year;
        choseMonthUI.value = month;

        choseYearUI.onChange = function () {
            console.log("year chose clicked -> value:", choseYearUI.value);
            selectedYear = choseYearUI.value;
            updateInfo(selectedYear, selectedMonth, selectedDay);
        }
        choseMonthUI.onChange = function () {
            console.log("month chose clicked -> value:", choseMonthUI.value,choseMonthUI.text,choseMonthUI);
            selectedMonth = choseMonthUI.value;
            updateInfo(selectedYear, selectedMonth, selectedDay);
        }
    }

    // 月份减1
    function procMonthMinus() {
        if (selectedMonth == 0) return;

        selectedMonth--;
        updateInfo(selectedYear, selectedMonth, selectedDay);
    }

    // 月份加1
    function procMonthAdd() {
        if (selectedMonth == 11) return;

        selectedMonth++;
        updateInfo(selectedYear, selectedMonth, selectedDay);
    }

    // 选择年份
    function procSelectYear() {
        var choseYearUI = api.get("选择年份");
        console.log("year chose clicked -> value:", choseYearUI.value);
        selectedYear = choseYearUI.value;
        updateInfo(selectedYear, selectedMonth, selectedDay);
    }

    // 选择月份
    function procSelectMonth() {
        var choseMonthUI = api.get("选择月份");
        console.log("month chose clicked -> value:", choseMonthUI.value,choseMonthUI.text);
        selectedMonth = choseMonthUI.value;
        updateInfo(selectedYear, selectedMonth, selectedDay);
    }

    // 选择日期
    function procSelectDay() {
        var t = api.getTarget(),
            id = t.id,
            index = t.index;
        console.log("clicked day -> id:", id, "index:", index);
        var data = list[index];
        console.log("data:", JSON.stringify(data));
        updateTopRight(selectedYear, data.month, data.nday);
        // var dayId = id + "[" + index + "]";
        // var dayUI = get(dayId);

    }

    // 更新右上角信息
    function updateTopRight(year, month, day) {
        var sdate = new Date(year, month, day);
        var ftime = sdate.format("yyyy-MM-dd");
        var whichDay = sdate.getDay(); // 判断是星期几，0代表星期天，1代表星期一
        console.log("update info, whichday: " + whichDay + " ftime: " + ftime, "星期几：", dayStrs[whichDay]);

        var res = api.data;
        res["当前选择日期"] = ftime;
        res["当前选择星期"] = "星期" + dayStrs[whichDay];
        api.update("当前选择日期", "当前选择星期");
        target.value = api.get("@当前选择日期");
    }

    // 右上角信息及内容面板
    function updateInfo(year, month, day) {
        updateTopRight(year, month, day);
        var choseYearUI = api.get("选择年份");
        var choseMonthUI = api.get("选择月份");
        choseYearUI.value = year;
        choseMonthUI.value = month;

        // 更新该年的月份日数（主要是因为闰月）
        daysPerMonth = new Array(31, 28 + isLeap(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
        updateContentList(year, month);
    }

    // 今天
    function showToday() {
        selectedYear = today.getFullYear(); // 日期中的年份
        selectedMonth = today.getMonth(); // 日期中的月份(月份是从0开始计算，获取的值比正常月份的值少1)
        selectedDay = today.getDate(); // 日期中的日
        updateInfo(selectedYear, selectedMonth, selectedDay);
    }

    // 更新面板list
    function updateContentList(year, month) {
        var firstDay = new Date(year, month, 1); // 获取当月的第一天
        var dayOfWeek = firstDay.getDay(); // 判断第一天是星期几(返回[0-6]中的一个，0代表星期天，1代表星期一，以此类推)
        if (dayOfWeek == 0) {
            dayOfWeek = 7; // 因为日历显示周日在最后
        }

        var data = {
            light: false, // 表示这个日子不是当月的
            nday: 1, // 几号
            pos: 0 // 表示这个日子的索引位置
        };

        list = [];
        var sday = 0; // 日子
        var lastMonthDay = daysPerMonth[month == 0 ? 11 : month - 1]; // 上个月的日子
        var nextMonthDay = 0; // 下个月的日子
        console.log("day of week: " + dayOfWeek, " last month day: ", lastMonthDay);
        for (var i = 1; i <= col * row; i++) {
            data = {};
            // 该日子是不是这个月份的
            if (i < dayOfWeek) { // 小于该月的
                data.month = month - 1;
                data.light = false;
                data.nday = lastMonthDay - dayOfWeek + (i + 1);
            } else if ((i - dayOfWeek + 1) > (daysPerMonth[month])) { // 大于该月的
                data.month = month + 1;
                data.light = false;
                nextMonthDay++;
                data.nday = nextMonthDay;
                console.log("i: " + i + " days: " + daysPerMonth[month] + " next day: " + nextMonthDay);
            } else { // 该月的
                data.month = month;
                data.light = true;
                data.nday = i - dayOfWeek + 1;
            }
            data.pos = i - 1;
            list.push(data);
        }
        // 后面超过一周不是本月的，删除掉
        if (nextMonthDay >= 7) {
            list.splice(list.length - 7, 7);
        }

        var json = JSON.stringify(list);
        console.log("list json: " + json);
        var res = api.data;
        res["日期列表"] = list;
        api.update("日期列表");

        var dlist = api.getChildren("日期列表");
        // console.log("ch num: " + dlist.length);
        for (var i = 0; i < dlist.length; i++) {
            data = list[i];

            var txt = api.get("日期[" + i + "]");
            if (data.light) {
                // console.log("data light");
                txt.draw({
                    color: 'rgba(0,0,0,1)'
                });
            } else {
                // console.log("data not light");
                txt.draw({
                    color: 'rgba(186,186,186,1)'
                });
            }
            // console.log("data:", data);
        }
    }

    return {
        init: init,    // 初始化
        procMonthMinus: procMonthMinus,    // 月份减1
        procMonthAdd: procMonthAdd,        // 月份加1
        procSelectYear: procSelectYear,    // 选择年份
        procSelectMonth: procSelectMonth,  // 选择月份
        procSelectDay: procSelectDay,      // 选择日期
        showToday: showToday,              // 返回今天

    };
})(api || {});
