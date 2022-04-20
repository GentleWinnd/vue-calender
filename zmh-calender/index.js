import { mapGetters } from 'vuex';
import { WxcOverlay } from 'weex-ui';
import { formatDate } from '../../../fliters/index'
const dom = weex.requireModule('dom')
const debounce = require('lodash.debounce');


export default {
  components: {
    WxcOverlay,

  },
  data: () => {
    return {
      show: false,
      top: 88,
      today: new Date(),
      currentIndexInfo: {
        "0": 0,
        "1": 0,
        "2": 0
      },
      leftText: "",
      title: "",
      dataSource: [],
      monitorScrolling: false,
      selCalenderDic: [
        { value: 0, index: -1 },
        { value: 0, index: -1 },
        { value: 0, index: -1 }
      ],
    }
  },
  created () {
    console.log("this.start===", this.start, this.length)
    this.today = this.defaultDate ? this.defaultDate : new Date()
    this.leftText = this.leftTitle ? this.leftTitle : this.leftText
    let date = this.start ? this.start : formatDate(new Date(), "yyyy-MM-dd")
    let year = Number.parseInt(date.split("-")[0])
    let month = Number.parseInt(date.split("-")[1])

    var yearsArr = []
    var monthArr = []
    var dayArr = []
    let yearLength = year + (this.length ? Number.parseInt(this.length) : 30)
    let sp = yearLength > year ? yearLength : year
    let sp0 = yearLength > year ? year : yearLength
    if (this.length == undefined) {
      sp = yearLength
      sp0 = 2000
    }
    for (let index = sp0; index <= sp; index++) {
      yearsArr.push(index)
    }
    console.log("this.start===", yearsArr)
    for (let index = 1; index <= 12; index++) {
      monthArr.push(index)
    }
    dayArr = this.caculateMonthDayNum(year, month)

    if (this.level > 1) {
      for (let index = -5; index < 1; index++) {
        if (index < -2) {
          yearsArr.push(index)
          monthArr.push(index)
          dayArr.push(index)
        } else {
          yearsArr.unshift(index)
          monthArr.unshift(index)
          dayArr.unshift(index)
        }
      }
    }
    console.log("this.leve", this.level)
    this.dataSource.push(yearsArr)
    if (this.level > 1) {
      this.dataSource.push(monthArr)
      this.dataSource.push(dayArr)
    }

  },
  mounted () {
    // let date = this.start ? this.start : formatDate(new Date(), "yyyy-MM-dd")
    let date = formatDate(this.today, "yyyy-MM-dd")
    if (date == undefined) date = formatDate(new Date(), "yyyy-MM-dd")
    let year = Number.parseInt(date.split("-")[0])
    let month = Number.parseInt(date.split("-")[1])
    let day = Number.parseInt(date.split("-")[2])

    const elYear = this.$refs[`item0${year - 3}`]
    // setTimeout(() => {
    if (elYear) dom.scrollToElement(elYear[0], {})
    // }, 100);
    if (this.level == 1) {
      this.title = `${year}年`;
      this.currentIndexInfo["0"] = this.getArrayIndex(this.dataSource[0], year)
      this.selCalenderDic[0].value = year;
      this.selCalenderDic[0].index = this.currentIndexInfo["0"];
      return
    }//一级为年所以在这里

    let mm = month < 4 ? (3 - month - 2) : month - 3
    const elMonth = this.$refs[`item1${mm}`]
    setTimeout(() => {
      if (elMonth) dom.scrollToElement(elMonth[0], {})
    }, 100);

    let dd = day < 4 ? (3 - day - 2) : day - 3
    const elDay = this.$refs[`item2${dd}`]
    setTimeout(() => {
      if (elDay) dom.scrollToElement(elDay[0], {})
    }, 200);

    setTimeout(() => {
      this.monitorScrolling = true
    }, 888);
    // return
    this.currentIndexInfo["0"] = this.getArrayIndex(this.dataSource[0], year)
    this.currentIndexInfo["1"] = this.getArrayIndex(this.dataSource[1], month)
    this.currentIndexInfo["2"] = this.getArrayIndex(this.dataSource[2], day)

    this.selCalenderDic[0].value = year
    this.selCalenderDic[0].index = this.currentIndexInfo["0"]
    this.selCalenderDic[1].value = month
    this.selCalenderDic[1].index = this.currentIndexInfo["1"]
    this.selCalenderDic[2].value = day
    this.selCalenderDic[2].index = this.currentIndexInfo["2"]
    this.title = `${year}年${month}月${day}日`
  },
  props: ['level', 'start', 'defaultDate', 'length', 'leftTitle'],
  computed: {
    ...mapGetters({
    }),
  },
  methods: {
    closeBtnAction () {
      this.$emit("closeAction")
    },
    confirmAction () {
      this.$emit("selResultAction", this.level == 1 ? this.title.substring(0, 4) : this.title)
    },
    wxcOverlayBodyClicked () {
      this.$emit("closeAction")
    },
    noLimitedDate () {
      this.title = this.leftText
      this.selCalenderDic = [
        { value: 0, index: -1 },
        { value: 0, index: -1 },
        { value: 0, index: -1 }
      ]
    },
    cellSelAction (secondItem, firstIndex, secondIndex) {
      if (this.level == 1) {
        this.title = `${secondItem}年`;
        this.confirmAction()
        return
      }
      let currentIndex = this.currentIndexInfo[firstIndex + ""]
      let index = (currentIndex - 3) - (currentIndex - secondIndex)
      let text = ""
      let dataArr = this.dataSource[firstIndex]
      if (index < dataArr.length) text = dataArr[index]
      let refKey = `item${firstIndex}${text}`
      if (refKey) this.setScrollerShow(refKey, dataArr[index + 3], firstIndex, index + 3)
    },
    setSelectedData (secondItem, firstIndex, secondIndex) {
      this.currentIndex = secondIndex
      this.selCalenderDic[firstIndex].value = secondItem
      this.selCalenderDic[firstIndex].index = secondIndex
      this.title = ""
      if (this.selCalenderDic[0].index > -1) this.title = this.selCalenderDic[0].value + "年"
      if (this.selCalenderDic[1].index > -1) this.title = this.title + this.selCalenderDic[1].value + "月"
      if (this.selCalenderDic[2].index > -1) this.title = this.title + this.selCalenderDic[2].value + "日"
      let dayArr = this.caculateMonthDayNum(this.selCalenderDic[0].value, this.selCalenderDic[1].value)
      for (let index = -5; index < 1; index++) {
        if (index < -2) {
          dayArr.push(index)
        } else {
          dayArr.unshift(index)
        }
      }
      this.dataSource[2] = dayArr
    },
    scrollingAction ($event, firstIndex) {

    },
    scrollendAction (event, firstIndex) {
      if (this.monitorScrolling == false) return
      let endY = event.contentOffset.y
      let index = Number.parseInt(endY / -100)
      let text = ""
      let dataArr = this.dataSource[firstIndex]
      if (index < dataArr.length) text = dataArr[index]
      let refKey = `item${firstIndex}${text}`
      if (refKey) this.setScrollerShow(refKey, dataArr[index + 3], firstIndex, index + 3)
    },
    setScrollerShow (refKey, secondItem, firstIndex, secondIndex) {
      const el = this.$refs[refKey]
      if (el.length > 0) dom.scrollToElement(el[0], {})
      if (this.level == 1) {
        this.title = `${secondItem}年`;
        this.currentIndexInfo["0"] = secondIndex
        this.selCalenderDic[0].value = year;
        this.selCalenderDic[0].index = this.currentIndexInfo["0"];
        return
      }//一级为年所以在这里
      this.setSelectedData(secondItem, firstIndex, secondIndex)
    },

    caculateMonthDayNum (year, month) {
      var monthArr = []
      let bigMonths = [1, 3, 5, 7, 8, 10, 12]
      let isLeapmonth = this.caculateLeapYear(year)
      let dayNum = month == 2 && isLeapmonth ? 29 : 28
      dayNum = bigMonths.includes(month) ? 31 : 30
      for (let index = 1; index <= dayNum; index++) {
        monthArr.push(index)
      }
      return monthArr
    },
    caculateLeapYear (year) {
      if (year % 100 == 0) {
        return year % 400 == 0
      } else {
        return year % 4 == 0
      }
    },
    getArrayIndex (arr, obj) {
      var i = arr.length;
      while (i--) {
        if (arr[i] === obj) {
          return i;
        }
      }
      return -1;
    },










    //返回农历y年的总天数
    lYearDays (y) {
      var i, sum = 348;
      for (i = 0x8000; i > 0x8; i >>= 1) sum += (lunarInfo[y - 1900] & i) ? 1 : 0;
      return (sum + leapDays(y));
    },
    //返回农历y年闰月的天数
    leapDays (y) {
      if (leapMonth(y)) return ((lunarInfo[y - 1900] & 0x10000) ? 30 : 29);
      else return (0);
    },
    //判断y年的农历中那个月是闰月,不是闰月返回0
    leapMonth (y) {
      return (lunarInfo[y - 1900] & 0xf);
    },
    //返回农历y年m月的总天数
    monthDays (y, m) {
      return ((lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29);
    },
    //算出当前月第一天的农历日期和当前农历日期下一个月农历的第一天日期
    Dianaday (objDate) {
      var i, leap = 0, temp = 0;
      var baseDate = new Date(1900, 0, 31);
      var offset = (objDate - baseDate) / 86400000;
      this.dayCyl = offset + 40;
      this.monCyl = 14;
      for (i = 1900; i < 2050 && offset > 0; i++) {
        temp = lYearDays(i)
        offset -= temp;
        this.monCyl += 12;
      }
      if (offset < 0) {
        offset += temp;
        i--;
        this.monCyl -= 12;
      }
      this.year = i;
      this.yearCyl = i - 1864;
      leap = leapMonth(i); //闰哪个月
      this.isLeap = false;
      for (i = 1; i < 13 && offset > 0; i++) {
        if (leap > 0 && i == (leap + 1) && this.isLeap == false) { //闰月
          --i; this.isLeap = true; temp = leapDays(this.year);
        }
        else {
          temp = monthDays(this.year, i);
        }
        if (this.isLeap == true && i == (leap + 1)) this.isLeap = false; //解除闰月
        offset -= temp;
        if (this.isLeap == false) this.monCyl++;
      }
      if (offset == 0 && leap > 0 && i == leap + 1)
        if (this.isLeap) { this.isLeap = false; }
        else { this.isLeap = true; --i; --this.monCyl; }
      if (offset < 0) { offset += temp; --i; --this.monCyl; }
      this.month = i;
      this.day = offset + 1;
    },
    //返回公历y年m+1月的天数
    solarDays (y, m) {
      if (m == 1)
        return (((y % 4 == 0) && (y % 100 != 0) || (y % 400 == 0)) ? 29 : 28);
      else
        return (solarMonth[m]);
    },
    //记录公历和农历某天的日期
    calElement (sYear, sMonth, sDay, week, lYear, lMonth, lDay, isLeap) {
      this.isToday = false;
      //公历
      this.sYear = sYear;
      this.sMonth = sMonth;
      this.sDay = sDay;
      this.week = week;
      //农历
      this.lYear = lYear;
      this.lMonth = lMonth;
      this.lDay = lDay;
      this.isLeap = isLeap;
      //节日记录
      this.lunarFestival = ''; //农历节日
      this.solarFestival = ''; //公历节日
      this.solarTerms = ''; //节气
    },
    //返回某年的第n个节气为几日(从0小寒起算)
    sTerm (y, n) {
      var offDate = new Date((31556925974.7 * (y - 1900) + sTermInfo[n] * 60000) + Date.UTC(1900, 0, 6, 2, 5));
      return (offDate.getUTCDate())
    },
    //保存y年m+1月的相关信息
    calendar (y, m) {
      var fat = mat = 9;
      var eve = 0;
      fat = mat = 0;
      var sDObj, lDObj, lY, lM, lD = 1, lL, lX = 0, tmp1, tmp2;
      var lDPOS = new Array(3);
      var n = 0;
      var firstLM = 0;
      sDObj = new Date(y, m, 1); //当月第一天的日期
      this.length = solarDays(y, m);  //公历当月天数
      this.firstWeek = sDObj.getDay();  //公历当月1日星期几
      if ((m + 1) == 5) { fat = sDObj.getDay() }
      if ((m + 1) == 6) { mat = sDObj.getDay() }
      for (var i = 0; i < this.length; i++) {
        if (lD > lX) {
          sDObj = new Date(y, m, i + 1);  //当月第一天的日期
          lDObj = new Dianaday(sDObj);   //农历
          lY = lDObj.year;      //农历年
          lM = lDObj.month;     //农历月
          lD = lDObj.day;      //农历日
          lL = lDObj.isLeap;     //农历是否闰月
          lX = lL ? leapDays(lY) : monthDays(lY, lM); //农历当月最後一天
          if (lM == 12) { eve = lX }
          if (n == 0) firstLM = lM;
          lDPOS[n++] = i - lD + 1;
        }
        this[i] = new calElement(y, m + 1, i + 1, nStr1[(i + this.firstWeek) % 7], lY, lM, lD++, lL);
        if ((i + this.firstWeek) % 7 == 0) {
          this[i].color = 'red'; //周日颜色
        }
      }
      //节气
      tmp1 = sTerm(y, m * 2) - 1;
      tmp2 = sTerm(y, m * 2 + 1) - 1;
      this[tmp1].solarTerms = solarTerm[m * 2];
      this[tmp2].solarTerms = solarTerm[m * 2 + 1];
      if ((this.firstWeek + 12) % 7 == 5) //黑色星期五
        this[12].solarFestival += '黑色星期五';
      if (y == tY && m == tM) this[tD - 1].isToday = true; //今日
    },
    //用中文显示农历的日期
    cDay (d) {
      var s;
      switch (d) {
        case 10:
          s = '初十'; break;
        case 20:
          s = '二十'; break;
          break;
        case 30:
          s = '三十'; break;
          break;
        default:
          s = nStr2[Math.floor(d / 10)];
          s += nStr1[d % 10];
      }
      return (s);
    },
    //在表格中显示公历和农历的日期,以及相关节日
    drawCld (SY, SM) {
      var cld;
      var TF = true;
      var p1 = p2 = "";
      var i, sD, s, size;
      cld = new calendar(SY, SM);
      GZ.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;【' + Animals[(SY - 4) % 12] + '】'; //生肖
      for (i = 0; i < 42; i++) {
        sObj = eval('SD' + i);
        lObj = eval('LD' + i);
        sObj.className = '';
        sD = i - cld.firstWeek;
        if (sD > -1 && sD < cld.length) { //日期内
          sObj.innerHTML = sD + 1;
          if (cld[sD].isToday) { sObj.style.color = '#9900FF'; } //今日颜色
          else { sObj.style.color = ''; }
          if (cld[sD].lDay == 1) { //显示农历月
            lObj.innerHTML = '<b>' + (cld[sD].isLeap ? '闰' : '') + cld[sD].lMonth + '月' + (monthDays(cld[sD].lYear, cld[sD].lMonth) == 29 ? '小' : '大') + '</b>';
          }
          else { lObj.innerHTML = cDay(cld[sD].lDay); } //显示农历日
          var Slfw = Ssfw = null;
          s = cld[sD].solarFestival;
          for (var ipp = 0; ipp < lFtv.length; ipp++) { //农历节日
            if (parseInt(lFtv[ipp].substr(0, 2)) == (cld[sD].lMonth)) {
              if (parseInt(lFtv[ipp].substr(2, 4)) == (cld[sD].lDay)) {
                lObj.innerHTML = lFtv[ipp].substr(5);
                Slfw = lFtv[ipp].substr(5);
              }
            }
            if (12 == (cld[sD].lMonth)) { //判断是否为除夕
              if (eve == (cld[sD].lDay)) { lObj.innerHTML = "除夕"; Slfw = "除夕"; }
            }
          }
          for (var ipp = 0; ipp < sFtv.length; ipp++) { //公历节日
            if (parseInt(sFtv[ipp].substr(0, 2)) == (SM + 1)) {
              if (parseInt(sFtv[ipp].substr(2, 4)) == (sD + 1)) {
                lObj.innerHTML = sFtv[ipp].substr(5);
                Ssfw = sFtv[ipp].substr(5);
              }
            }
          }
          if ((SM + 1) == 5) { //母亲节
            if (fat == 0) {
              if ((sD + 1) == 7) { Ssfw = "母亲节"; lObj.innerHTML = "母亲节" }
            }
            else if (fat < 9) {
              if ((sD + 1) == ((7 - fat) + 8)) { Ssfw = "母亲节"; lObj.innerHTML = "母亲节" }
            }
          }
          if ((SM + 1) == 6) { //父亲节
            if (mat == 0) {
              if ((sD + 1) == 14) { Ssfw = "父亲节"; lObj.innerHTML = "父亲节" }
            }
            else if (mat < 9) {
              if ((sD + 1) == ((7 - mat) + 15)) { Ssfw = "父亲节"; lObj.innerHTML = "父亲节" }
            }
          }
          if (s.length <= 0) { //设置节气的颜色
            s = cld[sD].solarTerms;
            if (s.length > 0) s = s.fontcolor('limegreen');
          }
          if (s.length > 0) { lObj.innerHTML = s; Slfw = s; } //节气
          if ((Slfw != null) && (Ssfw != null)) {
            lObj.innerHTML = Slfw + "/" + Ssfw;
          }
        }
        else { //非日期
          sObj.innerHTML = '';
          lObj.innerHTML = '';
        }
      }
    },
    //在下拉列表中选择年月时,调用自定义函数drawCld(),显示公历和农历的相关信息
    changeCld () {
      var y, m;
      y = CLD.SY.selectedIndex + 1900;
      m = CLD.SM.selectedIndex;
      drawCld(y, m);
    },

    //打开页时,在下拉列表中显示当前年月,并调用自定义函数drawCld(),显示公历和农历的相关信息
    initial () {
      //用自定义变量保存当前系统中的年月日
      var Today = new Date();
      var tY = Today.getFullYear();
      var tM = Today.getMonth();
      var tD = Today.getDate();
      CLD.SY.selectedIndex = tY - 1900;
      CLD.SM.selectedIndex = tM;
      drawCld(tY, tM);
    },









  }
}