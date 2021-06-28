# web-logger
基于indexDB的前端日志

## use

import Logger from 'rhea-log'
let logger = new Logger({
  userName: 'xxx', // store name,  type string
  expirationTime: 2 // Day, type: number, default: 2,
})

### add 
logger.addLogger(log: string || object)
### search
logger.getLogger(star?: Date, end?: Date) // default star: Date.now() - 24*3600*1000  end: Date.now()
### export
logger.exportLogger(star?: Date, end?: Date) // export to excel, default star: Date.now() - 24*3600*1000  end: Date.now()


