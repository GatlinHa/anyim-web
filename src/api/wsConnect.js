import { Msg, Header, MsgType } from '@/proto/msg'
import { MAGIC } from '@/const/msgConst'

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

  constructor() {
    const aar = [14, 10, 12, 8, 139, 150, 196, 240, 8, 16, 0, 24, 0]
    this.buffer = new Uint8Array(aar)
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

  async onMessage(evt) {
    console.log('onMessage')
    const arrayBuffer = await evt.data.arrayBuffer()
    const frames = this.decode(new Uint8Array(arrayBuffer))

    frames.forEach((frame) => {
      const res = Msg.decode(frame)
      console.log('Decoded res:', res)
    })
  }

  onClose(evt) {
    console.log('onClose', evt)
  }

  onOpen() {
    console.log('onOpen')
    const header = Header.create({
      magic: MAGIC,
      version: 0,
      msgType: MsgType.HELLO,
      isExtension: false
    })
    const hello = Msg.create({ header: header })
    const payload = Msg.encode(hello).finish()
    const data = this.encodePayload(payload)
    console.log('encode data: ', data)
    this.connect.send(data)
  }

  onError(evt) {
    console.log('onError', evt)
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
   * 接收消息后对payload进行解码，剥离掉长度
   * @param {*} buf
   * @returns
   */
  decodePayload(buf) {
    const view = new DataView(buf)
    let byteIndex = 0

    let length = 0
    let shift = 0
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const byte = view.getUint8(byteIndex)
      length |= (byte & 0x7f) << shift
      byteIndex++
      if ((byte & 0x80) === 0) {
        break
      }
      shift += 7
    }

    return new Uint8Array(buf, byteIndex, length)
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
