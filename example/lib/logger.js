/**
 * @author: guangzhen.ju.o
 * @date: 15/06/2021 14:18
 * */

import Dexie from 'dexie'

// const Dexie = require('dexie')

export default class Database extends Dexie {
  constructor({ userName, expirationTime }) {
    if(typeof userName !== 'string') {
      throw 'userName must be string'
    }
    
    super(userName)

    this.userName = userName

    this.headers = [{
      label: 'ID', props: 'id'
    }, {
      label: '用户', props: 'user'
    }, {
      label: '时间戳', props: 'timeStamp'
    }, {
      label: '记录时间', props: 'logDate'
    }, {
      label: 'UserAgent', props: 'userAgent'
    }, {
      label: 'Platform', props: 'platform'
    }, {
      label: 'Is Online', props: 'onLine'
    }, {
      label: 'Vendor', props: 'vendor'
    }, {
      label: '最大内存限制', props: 'jsHeapSizeLimit'
    }, {
      label: '可用内存', props: 'totalJSHeapSize'
    }, {
      label: '已使用内存', props: 'usedJSHeapSize'
    }, {
      label: '记录内容', props: 'loggerInfo'
    }]

    this.navigatorList = ['userAgent', 'platform', 'vendor']

    this.expirationTime = (expirationTime || 2)*24*3600*1000 // 保留近2天的日志

    this.version(1).stores({
      logger: '++id, timeStamp'
    })

    this.logger = this.table('logger')
    this.updateDatabase().then()

  }

  // #log() {
  //   return console.log(...arguments)
  // }

  // 每次都更新一下数据库  目前只是移除过期数据
  async updateDatabase() {

    let list = await this.getLogger(0, new Date(Date.now() - this.expirationTime).getTime())

    this.logger.bulkDelete(list.map(log => log.id)) // 批量删除
  }
  // getTable
  getTable() {
    return this.logger
  }
  // 获取日志
  async getLogger(start = 0, end = Date.now()) {

    return this.logger.where('timeStamp').between(start, end, true, true).toArray()

  }

  // 添加日志
  addLogger(log) {
    if(!log) return
    // this.#log(`添加${log}`, {a: 2})

    this.logger.add({
      user: this.userName,
      timeStamp: Date.now(),
      onLine: navigator.onLine,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit/1024/1024, // 最大内存限制
      totalJSHeapSize: performance.memory.totalJSHeapSize/1024/1024, // 可使用内存
      usedJSHeapSize: performance.memory.usedJSHeapSize/1024/1024, // JS占用内存 如果大于totalJSHeapSize 极大可能内存泄漏
      loggerInfo: typeof log === 'string' ? log : JSON.stringify(log)
    })
  }

  // 生成表格
  async objectToTable(start, end) {
    // this.#log('生成表格...')
    let logList = await this.getLogger(start, end)
    if(!logList || !logList.length) {
      console.info('未查询到日志')
      return
    }
    const colsHead = `<tr style="background: #00bebe;">${this.headers.map(column => `<td>${column.label}</td>`).join('')}</tr>`

    // 如果usedJSHeapSize超出了totalJSHeapSize  就给一个样式标识出来
    const colsData = logList.map(obj => [`<tr style="background: ${ this.setTrBg(obj) }">
								${this.headers.map(column => {
								  if(column.props === 'logDate') {
								    return `<td>${ obj.timeStamp ? new Date(obj.timeStamp).format('yyyy-MM-dd hh:mm:ss') : '' }</td>`
                  }
								  if(this.navigatorList.includes(column.props)) { // 处理浏览器标识
                    return `<td>${ navigator[column.props] ? navigator[column.props] : '' }</td>`
                  }
								  return `<td>${ obj.hasOwnProperty(column.props) ? obj[column.props] : '' }</td>`
    }).join('')}
            </tr>`])
      .join('')

    return `<table border>${colsHead}${colsData}</table>`.trim()
  }

  setTrBg(column) {
    if(!column.onLine) {
      return 'yellow'
    } else if(column.usedJSHeapSize > column.totalJSHeapSize){
      return 'red'
    }
  }

  // 导出  默认查询最近24小时
  async exportLogger(start = new Date(new Date().setHours(new Date().getHours() - 24)).getTime(), end = Date.now()) {
    // this.#log('导出开始....')
    const TEMPLATE_XLS = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
        <head><!--[if gte mso 9]><xml>
        <x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{title}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml>
        <![endif]--></head>
        <body>{table}</body></html>`

    const MIME_XLS = 'application/vnd.ms-excel;base64,'

    const parameters = {
      title: 'this._title',
      table: await this.objectToTable(start, end),
    };
    // console.log(parameters, 'parameters')
    // this.#log(parameters, '处理输出...')
    const computeOutput = TEMPLATE_XLS.replace(/{(\w+)}/g, (x, y) => parameters[y])

    const computedXLS = new Blob([computeOutput], {
      type: MIME_XLS,
    });
    // this.#log('开始下载...')
    const xlsLink = window.URL.createObjectURL(computedXLS)
    this.downloadFile(xlsLink, `${this.userName}.xls`)

  }

  downloadFile(url, fileName) {
    const link = document.createElement('a')
    document.body.appendChild(link)
    link.download = fileName
    link.href = url
    // return
    link.click()
  }

}
