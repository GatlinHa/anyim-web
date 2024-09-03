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
