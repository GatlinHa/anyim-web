import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import {
  msgUpdateSessionService,
  msgChatSessionListService,
  msgQueryPartitionService
} from '@/api/message'
import { ElMessage } from 'element-plus'

// 消息功能相关需要缓存的数据，不持久化存储
export const messageStore = defineStore('anyim-message', () => {
  /**
   * message页面当前被选中的sessionId
   */
  const selectedSessionId = ref('')

  const setSelectedSessionId = (id) => {
    selectedSessionId.value = id
  }

  /**
   * 会话列表
   * 格式：{sessionId_1: session_1, sessionId_2: session_2, ...}
   */
  const sessionList = ref({})

  /**
   * 会话消息，双层key-value结构，方便随机查找
   * 格式：
   * {
   *   sessionId_1: {
   *     msgId_1: {msgId: msgId_1, fromId: xxx,...},
   *     msgId_2: {msgId: msgId_2, fromId: xxx,...},
   *     ...
   *   }
   *   sessionId_2: {
   *     msgId_a: {msgId: msgId_a, fromId: xxx,...},
   *     msgId_b: {msgId: msgId_b, fromId: xxx,...},
   *     ...
   *   }
   *   ...
   * }
   */
  const msgRecordsList = ref({})

  /**
   * 会话消息ID排序后的数组，只存msgId,方便顺序查找
   * 格式：
   * {
   *   sessionId_1: [msgId_1, msgId_2...],
   *   sessionId_2: [msgId_a, msgId_b...]
   *   ...
   * }
   */
  const msgIdSortArray = ref({})

  /**
   * 用于消息唯一性校验，key是seq，value是msgId
   */
  const msgUniqueSeq = ref({})

  const addSession = (session) => {
    sessionList.value[session.sessionId] = session
  }

  const deleteSession = (sessionId) => {
    delete sessionList.value[sessionId]
  }

  const updateSession = async (obj) => {
    let params = { sessionId: obj.sessionId }
    let flag = false // 是否需要更新云端的数据
    if ('top' in obj) {
      params.top = obj.top
      flag = true
    }
    if ('dnd' in obj) {
      params.dnd = obj.dnd
      flag = true
    }
    // 注意,这里draft允许为""空串,有实际意义
    if ('draft' in obj && sessionList.value[obj.sessionId].draft !== obj.draft) {
      params.draft = obj.draft
      flag = true
    }
    if ('mark' in obj) {
      params.mark = obj.mark
      flag = true
    }
    if ('partitionId' in obj) {
      params.partitionId = obj.partitionId
      flag = true
    }

    const mySession = sessionList.value[obj.sessionId]
    if ('unreadCount' in obj) mySession.unreadCount = obj.unreadCount
    if ('remoteRead' in obj) mySession.remoteRead = obj.remoteRead
    if ('readMsgId' in obj) mySession.readMsgId = obj.readMsgId
    if ('readTime' in obj) mySession.readTime = obj.readTime
    if ('pullMsgDone' in obj) mySession.pullMsgDone = obj.pullMsgDone
    if ('objectInfo' in obj) mySession.objectInfo = obj.objectInfo

    if (flag) {
      //TODO 这里可以加一个loading遮罩效果
      const res = await msgUpdateSessionService(params)
      // 云端更新成功再更新本地，保持数据同步
      if (res.data.code === 0) {
        if ('top' in obj) mySession.top = obj.top
        if ('dnd' in obj) mySession.dnd = obj.dnd
        if ('draft' in obj) mySession.draft = obj.draft
        if ('mark' in obj) {
          mySession.mark = obj.mark
          ElMessage.success('保存成功')
        }
        if ('partitionId' in obj) {
          mySession.partitionId = obj.partitionId
          ElMessage.success('保存成功')
        }
      }
    }
  }

  /**
   * 对话列表中加入新的消息数组
   * @param {*} sessionId 会话id
   * @param {*} msgRecords 新的消息数组
   */
  const addMsgRecords = (sessionId, msgRecords) => {
    if (!msgRecords?.length) return

    msgRecords.forEach((item) => {
      if (!msgRecordsList.value[sessionId]) {
        msgRecordsList.value[sessionId] = {}
      }

      // seq为undefined或者seq没有被缓存，才能add这条消息
      if (item.seq === undefined || !(item.seq in msgUniqueSeq.value)) {
        msgRecordsList.value[sessionId][item.msgId] = item
        if (item.seq !== undefined) {
          // seq不为空则添加至缓存
          msgUniqueSeq.value[item.seq] = item.msgId
        }
      }
    })
    // 更新排序
    msgIdSortArray.value[sessionId] = Object.keys(msgRecordsList.value[sessionId])
      .map((key) => parseInt(key)) // Object.keys得到的是string数组
      .sort((a, b) => a - b)
  }

  /**
   * 移除某个消息：消息已发出后，用正式消息替换temp消息场景
   * @param {*} sessionId 会话id
   * @param {*} msgId 消息id
   */
  const removeMsgRecord = (sessionId, msgId) => {
    const msg = msgRecordsList.value[sessionId][msgId]
    if (msg === undefined) return
    if (msg.seq in msgUniqueSeq.value) delete msgUniqueSeq.value[msg.seq]
    if (msgId in msgRecordsList.value[sessionId]) delete msgRecordsList.value[sessionId][msgId]
  }

  const getMsg = (sessionId, msgId) => {
    if (!msgRecordsList.value[sessionId] || !msgRecordsList.value[sessionId][msgId]) {
      return {}
    }
    return msgRecordsList.value[sessionId][msgId]
  }

  const totalUnReadCount = computed(() => {
    return Object.values(sessionList.value).reduce(
      (sum, item) => (item?.unreadCount ? sum + item.unreadCount : sum),
      0
    )
  })

  const el = document.getElementsByTagName('title')[0]
  const title = import.meta.env.VITE_TITLE
  let task = null
  watch(
    () => totalUnReadCount.value,
    (newValue) => {
      if (totalUnReadCount.value > 0) {
        const newTitle = `您有(${newValue > 99 ? '99+' : newValue})条未读消息!`
        clearInterval(task)
        task = setInterval(() => {
          el.innerText = el.innerText === title ? newTitle : title
        }, 1000)
      } else {
        clearInterval(task)
        el.innerText = title
      }
    }
  )

  const clear = () => {
    selectedSessionId.value = ''
    sessionList.value = {}
    msgRecordsList.value = {}
    partitions.value = {}
  }

  /**
   * 分组信息
   */
  const partitions = ref({})

  const setPartitions = (obj) => {
    partitions.value = obj
  }

  /**
   * 加载会话列表
   * @returns
   */
  const loadSessionList = async () => {
    if (!Object.keys(sessionList.value).length) {
      const res = await msgChatSessionListService()
      Object.keys(res.data.data).forEach((item) => {
        addSession(res.data.data[item].session)
        addMsgRecords(item, res.data.data[item].msgList)
      })
    }
  }

  /**
   * 加载分组信息
   * @returns
   */
  const loadPartitions = async () => {
    if (Object.keys(partitions.value).length === 0) {
      const res = await msgQueryPartitionService()
      const data = {}
      res.data.data.forEach((item) => {
        data[item.partitionId] = item
      })
      setPartitions(data)
    }
  }

  return {
    selectedSessionId,
    setSelectedSessionId,
    sessionList,
    addSession,
    deleteSession,
    updateSession,
    loadSessionList,

    msgRecordsList,
    msgIdSortArray,
    addMsgRecords,
    removeMsgRecord,
    getMsg,

    partitions,
    setPartitions,
    loadPartitions,

    clear
  }
})
