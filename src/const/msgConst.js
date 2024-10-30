export const msgType = {
  NO_MORE_MSG: 1,
  USER_MSG: 2
}

export const proto = {
  magic: 0x8e110b0b,
  version: 0x01
}

// 和服务端约定好的，第一个消息都是从10001开始的
export const BEGIN_MSG_ID = 10001
