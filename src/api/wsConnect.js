import { Msg, Header, MsgType } from '@/proto/msg'
import { proto } from '@/const/msgConst'
import { userStore } from '@/stores'

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

  userData

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
   * 构造函数
   */
  constructor() {
    this.userData = userStore()
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
  createWs() {
    if (this.isConnect) {
      return
    }
    console.log('create websocket')
    this.url = `${import.meta.env.VITE_WS_URL}?token=${this.userData.at.token}`
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
    this.connect && this.connect.close(1000)
    this.connect = null
    this.isConnect = false
  }

  onOpen() {
    console.log('onOpen')
    const header = Header.create({
      magic: proto.magic,
      version: proto.version,
      msgType: MsgType.HELLO,
      isExtension: false
    })
    const hello = Msg.create({ header: header })
    const payload = Msg.encode(hello).finish()
    const data = this.encodePayload(payload)
    this.connect.send(data)
  }

  async onMessage(evt) {
    const arrayBuffer = await evt.data.arrayBuffer()
    const frames = this.decode(new Uint8Array(arrayBuffer))

    frames.forEach((frame) => {
      const msg = Msg.decode(frame)
      console.log('onMessage, msg is: ', msg)
      switch (msg.header.msgType) {
        case MsgType.HELLO:
          this.handleHello()
          break
        case MsgType.HEART_BEAT:
          this.handleHeartBeat()
          break
        default:
          console.log('The message type is not supported: ', msg.header.msgType)
          break
      }
    })
  }

  onClose(evt) {
    console.log('onClose', evt)
    this.heartBeat.stop()
    this.connect && this.connect.close()
    this.connect = null
    this.isConnect = false
    if (evt.code != 1000) {
      this.reconnect.start() // 正常关闭要重连
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

  handleHello() {
    // 启动心跳
    this.heartBeat.start()
    this.isConnect = true
  }

  handleHeartBeat() {
    if (this.heartBeat.healthPoint > 0) this.heartBeat.healthPoint--
  }

  /**
   * 发送前对长度编码，配合服务端解决半包黏包问题
   * @param {*} payload
   * @returns
   */
  encodePayload(payload) {
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

  sendHeartBeat() {
    if (this.heartBeat.healthPoint >= this.heartBeat.timeoutTimes) {
      console.log('heart beat timeout')
      this.heartBeatStop()
      this.connect && this.connect.close()
      this.connect = null
      this.isConnect = false
      this.reconnect.start()
    } else {
      const header = Header.create({
        magic: proto.magic,
        version: proto.version,
        msgType: MsgType.HEART_BEAT,
        isExtension: false
      })
      const heartBeat = Msg.create({ header: header })
      const payload = Msg.encode(heartBeat).finish()
      const data = this.encodePayload(payload)
      this.connect.send(data)
      this.heartBeat.healthPoint++
      console.log('send heart beat, the health point is: ', this.heartBeat.healthPoint)
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
