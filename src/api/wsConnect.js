import { Msg, Header, MsgType } from '@/proto/msg'
import { PROTO } from '@/const/msgConst'

class WsConnect {
  /**
   * 单例
   */
  static instance = null

  /**
   * WebSockt连接对象
   */
  connect

  /**
   * 消息接收缓冲区
   */
  buffer

  /**
   * 心跳设置
   */
  heartBeat

  constructor() {
    this.buffer = new Uint8Array()
    this.heartBeat = {
      interval: 5000, // 间隔时间
      timeoutTimes: 3, // 超时次数，超过该次数不再发心跳
      healthPoint: 0, // 健康指数，心跳发出+1，收到心跳-1，最小不能小于0，超过timeoutTimes次数视为心跳中断
      taskObj: null,
      task: () => {
        if (this.heartBeat.healthPoint >= this.heartBeat.timeoutTimes) {
          this.heartBeat.stop()
          console.log('心跳超时，关闭心跳')
          // TODO 重连
        }
        const header = Header.create({
          magic: PROTO.magic,
          version: PROTO.version,
          msgType: MsgType.HEART_BEAT,
          isExtension: false
        })
        const heartBeat = Msg.create({ header: header })
        const payload = Msg.encode(heartBeat).finish()
        const data = this.encodePayload(payload)
        this.connect.send(data)
        this.heartBeat.healthPoint++
        console.log('发送WebSocket心跳，心跳指数是：', this.heartBeat.healthPoint)
      },
      start: () => {
        if (!this.heartBeat.taskObj) {
          this.heartBeat.stop()
        }
        this.heartBeat.taskObj = setInterval(this.heartBeat.task, this.heartBeat.interval)
      },
      stop: () => {
        this.heartBeat.taskObj && clearInterval(this.heartBeat.taskObj)
      }
    }
  }

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
   * 相关配置
   */
  config = {
    url: '',
    account: '',
    clientId: '',
    token: ''
  }

  /**
   * 创建websocket
   */
  createWs(account, clientId, token) {
    this.config.url = `${import.meta.env.VITE_WS_URL}?token=${token}`
    this.config.account = account
    this.config.clientId = clientId
    this.config.token = token

    this.connect = new WebSocket(this.config.url)
    this.connect.onmessage = this.onMessage.bind(this)
    this.connect.onclose = this.onClose.bind(this)
    this.connect.onopen = this.onOpen.bind(this)
    this.connect.onerror = this.onError.bind(this)
  }

  onOpen() {
    console.log('onOpen')
    const header = Header.create({
      magic: PROTO.magic,
      version: PROTO.version,
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
          console.log('不支持该message type: ', msg.header.msgType)

          break
      }
      console.log()
    })
  }

  onClose(evt) {
    console.log('onClose', evt)
    this.heartBeat.stop()
  }

  onError(evt) {
    console.log('onError', evt)
    this.heartBeat.stop()
    // 先关闭心跳，再重连 TODO
  }

  handleHello() {
    // 启动心跳
    this.heartBeat.start()
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
}

export default WsConnect.getInstance()
