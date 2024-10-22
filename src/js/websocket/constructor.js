import { Msg, Header, MsgType, Body } from '@/proto/msg'
import { proto } from '@/const/msgConst'
import { userStore } from '@/stores'
import { v4 as uuidv4 } from 'uuid'

export const chatConstructor = (toId, content, tempMsgId) => {
  const header = Header.create({
    magic: proto.magic,
    version: proto.version,
    msgType: MsgType.CHAT,
    isExtension: false
  })

  const userData = userStore()
  const body = Body.create({
    fromId: userData.user.account,
    fromClient: userData.clientId,
    toId: toId,
    content: content,
    tempMsgId: tempMsgId
  })
  const chatMsg = Msg.create({ header: header, body: body })
  const payload = Msg.encode(chatMsg).finish()
  const data = encodePayload(payload)

  return data
}

export const heartBeatConstructor = () => {
  const header = Header.create({
    magic: proto.magic,
    version: proto.version,
    msgType: MsgType.HEART_BEAT,
    isExtension: false
  })
  const heartBeat = Msg.create({ header: header })
  const payload = Msg.encode(heartBeat).finish()
  const data = encodePayload(payload)

  return data
}

export const helloConstructor = () => {
  const header = Header.create({
    magic: proto.magic,
    version: proto.version,
    msgType: MsgType.HELLO,
    isExtension: false
  })
  const hello = Msg.create({ header: header })
  const payload = Msg.encode(hello).finish()
  const data = encodePayload(payload)

  return data
}

export const chatReadConstructor = (toId, content) => {
  const header = Header.create({
    magic: proto.magic,
    version: proto.version,
    msgType: MsgType.CHAT_READ,
    isExtension: false
  })

  const userData = userStore()
  const body = Body.create({
    fromId: userData.user.account,
    fromClient: userData.clientId,
    toId: toId,
    content: content,
    tempMsgId: uuidv4()
  })
  const chatMsg = Msg.create({ header: header, body: body })
  const payload = Msg.encode(chatMsg).finish()
  const data = encodePayload(payload)

  return data
}

export const statusReqConstructor = (accounts) => {
  const header = Header.create({
    magic: proto.magic,
    version: proto.version,
    msgType: MsgType.STATUS_REQ,
    isExtension: false
  })

  const userData = userStore()
  const body = Body.create({
    fromId: userData.user.account,
    fromClient: userData.clientId,
    content: accounts
  })

  const msg = Msg.create({ header: header, body: body })
  const payload = Msg.encode(msg).finish()
  const data = encodePayload(payload)
  return data
}

/**
 * 发送前对长度编码，配合服务端解决半包黏包问题
 * @param {*} payload
 * @returns
 */
const encodePayload = (payload) => {
  let num = payload.length
  let lenEncode = []
  while (num > 0) {
    let byte = num & 0x7f
    num >>= 7
    if (num > 0) {
      byte |= 0x80
    }
    lenEncode.push(byte)
  }
  return Uint8Array.of(...lenEncode, ...payload)
}
