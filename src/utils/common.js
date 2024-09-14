import CryptoJS from 'crypto-js'

export const maskPhoneNum = (str) => {
  if (str.length < 7) {
    return '*'
  }
  const start = str.slice(0, 3)
  const end = str.slice(-4)
  const middle = '*'.repeat(str.length - 7)
  return start + middle + end
}

// 使用简单的哈希算法，根据账号生成颜色
export const getRandomColor = (account) => {
  let hash = 0
  for (let i = 0; i < account.length; i++) {
    hash = account.charCodeAt(i) + ((hash << 5) - hash)
  }
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    const hex = value.toString(16).padStart(2, '0')
    color += hex
  }

  return color
}

// 根据背景色算出是用黑色字体还是白色字体
export const getFontColor = (backgroundColor) => {
  // 将十六进制颜色值转换为 RGB 值
  const r = parseInt(backgroundColor.slice(1, 3), 16)
  const g = parseInt(backgroundColor.slice(3, 5), 16)
  const b = parseInt(backgroundColor.slice(5, 7), 16)

  // 计算亮度
  const brightness = (r * 299 + g * 587 + b * 114) / 1000

  // 根据亮度确定对比明显的字体颜色
  return brightness > 128 ? '#000000' : '#FFFFFF'
}

export const generateClientId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let clientId = ''
  for (let i = 0; i < 8; i++) {
    clientId += characters[Math.floor(Math.random() * characters.length)]
  }
  return clientId
}

export const sessionShowTime = (datetime) => {
  const now = new Date()
  const inputDate = new Date(datetime)

  const isToday =
    now.getDate() === inputDate.getDate() &&
    now.getMonth() === inputDate.getMonth() &&
    now.getFullYear() === inputDate.getFullYear()

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const isYesterday =
    yesterday.getDate() === inputDate.getDate() &&
    yesterday.getMonth() === inputDate.getMonth() &&
    yesterday.getFullYear() === inputDate.getFullYear()

  const dayBeforeYesterday = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
  const isDayBeforeYesterday =
    dayBeforeYesterday.getDate() === inputDate.getDate() &&
    dayBeforeYesterday.getMonth() === inputDate.getMonth() &&
    dayBeforeYesterday.getFullYear() === inputDate.getFullYear()

  if (isToday) {
    const hours = inputDate.getHours().toString().padStart(2, '0')
    const minutes = inputDate.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  } else if (isYesterday) {
    return '昨天'
  } else if (isDayBeforeYesterday) {
    return '前天'
  } else {
    const year = inputDate.getFullYear() % 100
    let month = inputDate.getMonth() + 1
    let day = inputDate.getDate()
    day = day < 10 ? day.toString() : day
    return `${year}/${month}/${day}`
  }
}

export const messageSysShowTime = (datetime) => {
  const now = new Date()
  const inputDate = new Date(datetime)

  const isToday =
    now.getDate() === inputDate.getDate() &&
    now.getMonth() === inputDate.getMonth() &&
    now.getFullYear() === inputDate.getFullYear()

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const isYesterday =
    yesterday.getDate() === inputDate.getDate() &&
    yesterday.getMonth() === inputDate.getMonth() &&
    yesterday.getFullYear() === inputDate.getFullYear()

  const dayBeforeYesterday = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
  const isDayBeforeYesterday =
    dayBeforeYesterday.getDate() === inputDate.getDate() &&
    dayBeforeYesterday.getMonth() === inputDate.getMonth() &&
    dayBeforeYesterday.getFullYear() === inputDate.getFullYear()

  if (isToday) {
    const hours = inputDate.getHours().toString().padStart(2, '0')
    const minutes = inputDate.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  } else if (isYesterday) {
    const hours = inputDate.getHours().toString().padStart(2, '0')
    const minutes = inputDate.getMinutes().toString().padStart(2, '0')
    return `昨天 ${hours}:${minutes}`
  } else if (isDayBeforeYesterday) {
    const hours = inputDate.getHours().toString().padStart(2, '0')
    const minutes = inputDate.getMinutes().toString().padStart(2, '0')
    return `前天 ${hours}:${minutes}`
  } else {
    const year = inputDate.getFullYear()
    const month = inputDate.getMonth() + 1
    const day = inputDate.getDate()
    const hours = inputDate.getHours().toString().padStart(2, '0')
    const minutes = inputDate.getMinutes().toString().padStart(2, '0')
    return `${year}年${month}月${day}日 ${hours}:${minutes}`
  }
}

export const messageBoxShowTime = (datatime) => {
  const currentDate = new Date(datatime)
  const year = currentDate.getFullYear()
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0')
  const day = currentDate.getDate().toString().padStart(2, '0')
  const hours = currentDate.getHours().toString().padStart(2, '0')
  const minutes = currentDate.getMinutes().toString().padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

export const generateSign = (key, content) => {
  try {
    const hash = CryptoJS.HmacSHA256(content, key)
    return CryptoJS.enc.Base64.stringify(hash)
  } catch (e) {
    return null
  }
}

export const combineId = (fromId, toId) => {
  if (fromId < toId) {
    return fromId + '@' + toId
  } else {
    return toId + '@' + fromId
  }
}
