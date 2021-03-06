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
      this.title = `${year}???`;
      this.currentIndexInfo["0"] = this.getArrayIndex(this.dataSource[0], year)
      this.selCalenderDic[0].value = year;
      this.selCalenderDic[0].index = this.currentIndexInfo["0"];
      return
    }//???????????????????????????

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
    this.title = `${year}???${month}???${day}???`
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
        this.title = `${secondItem}???`;
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
      if (this.selCalenderDic[0].index > -1) this.title = this.selCalenderDic[0].value + "???"
      if (this.selCalenderDic[1].index > -1) this.title = this.title + this.selCalenderDic[1].value + "???"
      if (this.selCalenderDic[2].index > -1) this.title = this.title + this.selCalenderDic[2].value + "???"
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
        this.title = `${secondItem}???`;
        this.currentIndexInfo["0"] = secondIndex
        this.selCalenderDic[0].value = year;
        this.selCalenderDic[0].index = this.currentIndexInfo["0"];
        return
      }//???????????????????????????
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










    //????????????y???????????????
    lYearDays (y) {
      var i, sum = 348;
      for (i = 0x8000; i > 0x8; i >>= 1) sum += (lunarInfo[y - 1900] & i) ? 1 : 0;
      return (sum + leapDays(y));
    },
    //????????????y??????????????????
    leapDays (y) {
      if (leapMonth(y)) return ((lunarInfo[y - 1900] & 0x10000) ? 30 : 29);
      else return (0);
    },
    //??????y?????????????????????????????????,??????????????????0
    leapMonth (y) {
      return (lunarInfo[y - 1900] & 0xf);
    },
    //????????????y???m???????????????
    monthDays (y, m) {
      return ((lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29);
    },
    //????????????????????????????????????????????????????????????????????????????????????????????????
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
      leap = leapMonth(i); //????????????
      this.isLeap = false;
      for (i = 1; i < 13 && offset > 0; i++) {
        if (leap > 0 && i == (leap + 1) && this.isLeap == false) { //??????
          --i; this.isLeap = true; temp = leapDays(this.year);
        }
        else {
          temp = monthDays(this.year, i);
        }
        if (this.isLeap == true && i == (leap + 1)) this.isLeap = false; //????????????
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
    //????????????y???m+1????????????
    solarDays (y, m) {
      if (m == 1)
        return (((y % 4 == 0) && (y % 100 != 0) || (y % 400 == 0)) ? 29 : 28);
      else
        return (solarMonth[m]);
    },
    //????????????????????????????????????
    calElement (sYear, sMonth, sDay, week, lYear, lMonth, lDay, isLeap) {
      this.isToday = false;
      //??????
      this.sYear = sYear;
      this.sMonth = sMonth;
      this.sDay = sDay;
      this.week = week;
      //??????
      this.lYear = lYear;
      this.lMonth = lMonth;
      this.lDay = lDay;
      this.isLeap = isLeap;
      //????????????
      this.lunarFestival = ''; //????????????
      this.solarFestival = ''; //????????????
      this.solarTerms = ''; //??????
    },
    //??????????????????n??????????????????(???0????????????)
    sTerm (y, n) {
      var offDate = new Date((31556925974.7 * (y - 1900) + sTermInfo[n] * 60000) + Date.UTC(1900, 0, 6, 2, 5));
      return (offDate.getUTCDate())
    },
    //??????y???m+1??????????????????
    calendar (y, m) {
      var fat = mat = 9;
      var eve = 0;
      fat = mat = 0;
      var sDObj, lDObj, lY, lM, lD = 1, lL, lX = 0, tmp1, tmp2;
      var lDPOS = new Array(3);
      var n = 0;
      var firstLM = 0;
      sDObj = new Date(y, m, 1); //????????????????????????
      this.length = solarDays(y, m);  //??????????????????
      this.firstWeek = sDObj.getDay();  //????????????1????????????
      if ((m + 1) == 5) { fat = sDObj.getDay() }
      if ((m + 1) == 6) { mat = sDObj.getDay() }
      for (var i = 0; i < this.length; i++) {
        if (lD > lX) {
          sDObj = new Date(y, m, i + 1);  //????????????????????????
          lDObj = new Dianaday(sDObj);   //??????
          lY = lDObj.year;      //?????????
          lM = lDObj.month;     //?????????
          lD = lDObj.day;      //?????????
          lL = lDObj.isLeap;     //??????????????????
          lX = lL ? leapDays(lY) : monthDays(lY, lM); //????????????????????????
          if (lM == 12) { eve = lX }
          if (n == 0) firstLM = lM;
          lDPOS[n++] = i - lD + 1;
        }
        this[i] = new calElement(y, m + 1, i + 1, nStr1[(i + this.firstWeek) % 7], lY, lM, lD++, lL);
        if ((i + this.firstWeek) % 7 == 0) {
          this[i].color = 'red'; //????????????
        }
      }
      //??????
      tmp1 = sTerm(y, m * 2) - 1;
      tmp2 = sTerm(y, m * 2 + 1) - 1;
      this[tmp1].solarTerms = solarTerm[m * 2];
      this[tmp2].solarTerms = solarTerm[m * 2 + 1];
      if ((this.firstWeek + 12) % 7 == 5) //???????????????
        this[12].solarFestival += '???????????????';
      if (y == tY && m == tM) this[tD - 1].isToday = true; //??????
    },
    //??????????????????????????????
    cDay (d) {
      var s;
      switch (d) {
        case 10:
          s = '??????'; break;
        case 20:
          s = '??????'; break;
          break;
        case 30:
          s = '??????'; break;
          break;
        default:
          s = nStr2[Math.floor(d / 10)];
          s += nStr1[d % 10];
      }
      return (s);
    },
    //??????????????????????????????????????????,??????????????????
    drawCld (SY, SM) {
      var cld;
      var TF = true;
      var p1 = p2 = "";
      var i, sD, s, size;
      cld = new calendar(SY, SM);
      GZ.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;???' + Animals[(SY - 4) % 12] + '???'; //??????
      for (i = 0; i < 42; i++) {
        sObj = eval('SD' + i);
        lObj = eval('LD' + i);
        sObj.className = '';
        sD = i - cld.firstWeek;
        if (sD > -1 && sD < cld.length) { //?????????
          sObj.innerHTML = sD + 1;
          if (cld[sD].isToday) { sObj.style.color = '#9900FF'; } //????????????
          else { sObj.style.color = ''; }
          if (cld[sD].lDay == 1) { //???????????????
            lObj.innerHTML = '<b>' + (cld[sD].isLeap ? '???' : '') + cld[sD].lMonth + '???' + (monthDays(cld[sD].lYear, cld[sD].lMonth) == 29 ? '???' : '???') + '</b>';
          }
          else { lObj.innerHTML = cDay(cld[sD].lDay); } //???????????????
          var Slfw = Ssfw = null;
          s = cld[sD].solarFestival;
          for (var ipp = 0; ipp < lFtv.length; ipp++) { //????????????
            if (parseInt(lFtv[ipp].substr(0, 2)) == (cld[sD].lMonth)) {
              if (parseInt(lFtv[ipp].substr(2, 4)) == (cld[sD].lDay)) {
                lObj.innerHTML = lFtv[ipp].substr(5);
                Slfw = lFtv[ipp].substr(5);
              }
            }
            if (12 == (cld[sD].lMonth)) { //?????????????????????
              if (eve == (cld[sD].lDay)) { lObj.innerHTML = "??????"; Slfw = "??????"; }
            }
          }
          for (var ipp = 0; ipp < sFtv.length; ipp++) { //????????????
            if (parseInt(sFtv[ipp].substr(0, 2)) == (SM + 1)) {
              if (parseInt(sFtv[ipp].substr(2, 4)) == (sD + 1)) {
                lObj.innerHTML = sFtv[ipp].substr(5);
                Ssfw = sFtv[ipp].substr(5);
              }
            }
          }
          if ((SM + 1) == 5) { //?????????
            if (fat == 0) {
              if ((sD + 1) == 7) { Ssfw = "?????????"; lObj.innerHTML = "?????????" }
            }
            else if (fat < 9) {
              if ((sD + 1) == ((7 - fat) + 8)) { Ssfw = "?????????"; lObj.innerHTML = "?????????" }
            }
          }
          if ((SM + 1) == 6) { //?????????
            if (mat == 0) {
              if ((sD + 1) == 14) { Ssfw = "?????????"; lObj.innerHTML = "?????????" }
            }
            else if (mat < 9) {
              if ((sD + 1) == ((7 - mat) + 15)) { Ssfw = "?????????"; lObj.innerHTML = "?????????" }
            }
          }
          if (s.length <= 0) { //?????????????????????
            s = cld[sD].solarTerms;
            if (s.length > 0) s = s.fontcolor('limegreen');
          }
          if (s.length > 0) { lObj.innerHTML = s; Slfw = s; } //??????
          if ((Slfw != null) && (Ssfw != null)) {
            lObj.innerHTML = Slfw + "/" + Ssfw;
          }
        }
        else { //?????????
          sObj.innerHTML = '';
          lObj.innerHTML = '';
        }
      }
    },
    //?????????????????????????????????,?????????????????????drawCld(),????????????????????????????????????
    changeCld () {
      var y, m;
      y = CLD.SY.selectedIndex + 1900;
      m = CLD.SM.selectedIndex;
      drawCld(y, m);
    },

    //????????????,????????????????????????????????????,????????????????????????drawCld(),????????????????????????????????????
    initial () {
      //???????????????????????????????????????????????????
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