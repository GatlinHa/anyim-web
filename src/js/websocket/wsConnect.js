import { Msg, MsgType } from '@/proto/msg'
import { userStore, messageStore } from '@/stores'
import { v4 as uuidv4 } from 'uuid'
import { generateSign, combineId } from '@/utils/common'
import { chatConstructor, heartBeatConstructor, helloConstructor } from './constructor'

class WsConnect {
  /**
   * 单例
   */
  static instance = null

  /**
   * 单例
   */
  static getInstance() {
    if (!WsConnect.instance) {
      WsConnect.instance = new WsConnect()
    }
    return WsConnect.instance
  }

  /**
   * WebSockt连接对象
   */
  connect

  /**
   * 是否连接标识
   */
  isConnect

  /**
   * 消息接收缓冲区
   */
  buffer

  /**
   * ws地址
   */
  url

  /**
   * 心跳设置
   */
  heartBeat = {
    interval: 5000, // 间隔时间
    timeoutTimes: 3, // 超时次数，超过该次数不再发心跳
    healthPoint: 0, // 健康指数，心跳发出+1，收到心跳-1，最小不能小于0，超过timeoutTimes次数视为心跳中断
    taskObj: null,
    task: null,
    start: null,
    stop: null
  }

  /**
   * 重连设置
   */
  reconnect = {
    interval: 5000, // 间隔时间
    task: null,
    taskObj: null,
    start: null,
    stop: null
  }

  /**
   * 重发设置
   */
  reSend = {
    interval: 1000, // 间隔时间
    timeoutTimes: 5, // 超时次数，超过该次数不再重发
    curReSendTimes: 0 // 当前重发的次数
  }

  /**
   * 绑定事件，() => {}留白的需要业务自己定义处理逻辑
   */
  events = {
    [MsgType.HELLO]: () => {
      this.heartBeat.start()
      this.isConnect = true
    },

    [MsgType.DELIVERED]: () => {},

    [MsgType.CHAT]: (msg) => {
      const msgId = msg.body.msgId
      const fromId = msg.body.fromId
      const toId = msg.body.toId
      const msgType = MsgType.CHAT
      const msgTime = new Date()
      const content = msg.body.content
      const msgData = messageStore()
      msgData.addMsgRecord(combineId(fromId, toId), {
        msgId: msgId,
        fromId: fromId,
        msgType: msgType,
        msgTime: msgTime,
        content: content
      })
    },

    [MsgType.HEART_BEAT]: () => {
      if (this.heartBeat.healthPoint > 0) this.heartBeat.healthPoint--
    }
  }

  /**
   * 业务处理器
   */
  dataConstructor = {
    [MsgType.HELLO]: helloConstructor,
    [MsgType.HEART_BEAT]: heartBeatConstructor,
    [MsgType.CHAT]: chatConstructor
  }

  /**
   * 构造函数
   */
  constructor() {
    this.buffer = new Uint8Array()
    this.isConnect = false

    this.heartBeat.task = this.sendHeartBeat.bind(this)
    this.heartBeat.start = this.heartBeatStart.bind(this)
    this.heartBeat.stop = this.heartBeatStop.bind(this)

    this.reconnect.task = this.reconnectTask.bind(this)
    this.reconnect.start = this.reconnectStart.bind(this)
    this.reconnect.stop = this.reconnectStop.bind(this)
  }

  /**
   * 创建ws连接，登录成功之后调用
   */
  async createWs() {
    if (this.isConnect) {
      return
    }
    console.log('create websocket')
    const userData = userStore()
    const token = await userData.getAccessToken()
    const traceId = uuidv4()
    const timestamp = Math.floor(new Date().getTime() / 1000)
    const sign = generateSign(userData.at.secret, `${traceId}${timestamp}`)
    this.url = `${import.meta.env.VITE_WS_URL}?traceId=${traceId}&timestamp=${timestamp}&sign=${sign}&token=${token}`
    this.connect = new WebSocket(this.url)
    this.connect.onmessage = this.onMessage.bind(this)
    this.connect.onclose = this.onClose.bind(this)
    this.connect.onopen = this.onOpen.bind(this)
    this.connect.onerror = this.onError.bind(this)
  }

  /**
   * 关闭ws连接，登出之后调用
   * @param {*} code 正常登出code填0
   */
  closeWs() {
    console.log('client close the websocket connect')
    this.heartBeat.stop()
    this.reconnect.stop()
    this.connect && this.connect.close(1000) //1000表示正常退出
    this.connect = null
    this.isConnect = false
  }

  onOpen(evt) {
    console.log('onOpen', evt)
    this.connect.send(helloConstructor())
  }

  async onMessage(evt) {
    const arrayBuffer = await evt.data.arrayBuffer()
    const frames = this.decode(new Uint8Array(arrayBuffer))

    frames.forEach((frame) => {
      const msg = Msg.decode(frame)
      console.log(`receive a ${MsgType[msg.header.msgType]} msg: `, msg)
      if (this.events[msg.header.msgType]) this.events[msg.header.msgType](msg)
    })
  }

  async onClose(evt) {
    console.log('onClose', evt)
    this.heartBeat.stop()
    this.connect && this.connect.close()
    this.connect = null
    this.isConnect = false
    if (evt.code != 1000) {
      this.reconnect.start() // 非正常关闭要重连
    }
  }

  onError(evt) {
    console.log('onError', evt)
    this.heartBeat.stop()
    this.connect && this.connect.close()
    this.connect = null
    this.isConnect = false
    this.reconnect.start()
  }

  /**
   * 数据解码，其中解决了半包黏包问题
   * @param {*} data
   * @returns
   */
  decode(data) {
    this.buffer = this.concatBuffers(this.buffer, data)

    const frames = []
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (this.buffer.length < 1) {
        break
      }

      let length = 0
      let shift = 0
      let byteIndex = 0
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (byteIndex >= this.buffer.length) {
          break
        }
        const byte = this.buffer[byteIndex]
        length |= (byte & 0x7f) << shift
        byteIndex++
        if ((byte & 0x80) === 0) {
          break
        }
        shift += 7
      }

      if (this.buffer.length < byteIndex + length) {
        console.log('receive half message, cache it first')
        break
      }

      const frame = this.buffer.subarray(byteIndex, byteIndex + length)
      frames.push(frame)
      this.buffer = this.buffer.subarray(byteIndex + length)
    }

    return frames
  }

  concatBuffers(buffer1, buffer2) {
    const newBuffer = new Uint8Array(buffer1.length + buffer2.length)
    newBuffer.set(buffer1)
    newBuffer.set(buffer2, buffer1.length)
    return newBuffer
  }

  /**
   * 绑定事件
   * @param {*} event
   * @param {*} callback
   */
  bindEvent(event, callback) {
    this.events[event] = callback
  }

  /**
   * 发送msg，封装了重发机制
   * @param {*} remoteId 对方id或者群id
   * @param {*} msgType
   * @param {*} content
   * @param {*} callback
   */
  sendMsg(remoteId, msgType, content, callback) {
    const data = this.dataConstructor[msgType](remoteId, content)
    this.sendAgent(data, callback)
  }

  /**
   * 发送代理，封装了重发机制
   */
  sendAgent(data, callback) {
    if (this.isConnect) {
      this.bindEvent(MsgType.DELIVERED, callback)
      this.connect.send(data)
    } else {
      if (this.reSend.curReSendTimes >= this.reSend.timeoutTimes) {
        console.log('resend too many times')
        this.reSend.curReSendTimes = 0
        // TODO 应该反馈到业务层给提示
      } else {
        setTimeout(() => {
          this.sendAgent(data, callback)
        }, this.reSend.interval)
        this.reSend.curReSendTimes++
      }
    }
  }

  sendHeartBeat() {
    if (this.heartBeat.healthPoint >= this.heartBeat.timeoutTimes) {
      console.log('heart beat timeout')
      this.heartBeatStop()
      this.connect && this.connect.close()
      this.connect = null
      this.isConnect = false
      this.reconnect.start()
    } else {
      this.connect.send(heartBeatConstructor())
      this.heartBeat.healthPoint++
    }
  }

  heartBeatStart() {
    console.log('启动心跳任务')
    if (this.heartBeat.taskObj) {
      return
    }
    this.heartBeat.taskObj = setInterval(this.heartBeat.task, this.heartBeat.interval)
  }

  heartBeatStop() {
    console.log('中止心跳任务')
    this.heartBeat.taskObj && clearInterval(this.heartBeat.taskObj)
    this.heartBeat.taskObj = null
    this.heartBeat.healthPoint = 0
  }

  reconnectTask() {
    if (!this.isConnect) {
      console.log('reconnecting websocket')
      this.createWs()
    } else {
      console.log('no need to reconnect websocket')
      this.reconnectStop()
    }
  }

  reconnectStart() {
    console.log('启动重连任务')
    if (this.reconnect.taskObj) {
      return
    }
    this.reconnect.taskObj = setInterval(this.reconnect.task, this.reconnect.interval)
  }

  reconnectStop() {
    console.log('中止重连任务')
    this.reconnect.taskObj && clearInterval(this.reconnect.taskObj)
    this.reconnect.taskObj = null
  }
}

export default WsConnect.getInstance()
