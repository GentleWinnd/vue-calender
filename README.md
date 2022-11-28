# vue-calender

仿 Android 原生日历选择器
![效果截图](https://github.com/GentleWinnd/vue-calender/blob/main/%E6%88%AA%E5%9B%BE/1171650504618_.pic.jpg)
- - - - -

## 组件代码
```
<calender 
    v-if="zmhClaenderSeting.show" 
    :level="zmhClaenderSeting.level" 
    :start="zmhClaenderSeting.start" 
    :length="zmhClaenderSeting.length"   
    :defaultDate="zmhClaenderSeting.defaultDate" 
    @selResultAction="zmhCalenderSelResultAction"
    @closeAction="zmhCalenderCloseAction">
</calender>


```
## 配置代码
```
  zmhClaenderSeting: { 
      start: formatDate(new Date(), "yyyy-MM-dd"), 
      length: -4,
      show: false,
      selDate: "", 
      defaultDate: new Date(), 
      level: 3, 
  }

