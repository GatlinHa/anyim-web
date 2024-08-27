export const maskPhoneNum = (str) => {
  if (str.length < 7) {
    return '*'
  }
  const start = str.slice(0, 3)
  const end = str.slice(-4)
  const middle = '*'.repeat(str.length - 7)
  return start + middle + end
}
