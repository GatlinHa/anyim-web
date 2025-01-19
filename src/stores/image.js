import { mtsImageService } from '@/api/mts'
import { defineStore } from 'pinia'
import { ref } from 'vue'

const pattern = /\{[a-f0-9]+\}/g

// image的缓存数据，不持久化存储
export const imageStore = defineStore('anyim-image', () => {
  /**
   * {
   *   objectId_01: {objectId: objectId_01, originUrl: xxx, thumbUrl: xxx},
   *   objectId_02: {objectId: objectId_02, originUrl: xxx, thumbUrl: xxx},
   * }
   */
  const image = ref({})

  const setImage = (obj) => {
    image.value[obj.objectId] = obj
  }

  const imageTrans = (content, maxWidth = 400, maxHeight = 300) => {
    const matches = content.match(pattern)
    if (!matches || matches.length === 0) {
      return content
    }

    new Set(matches).forEach((item) => {
      let startIndex = item.indexOf('{')
      let endIndex = item.indexOf('}')
      const objectId = item.slice(startIndex + 1, endIndex)
      const thumbUrl = image.value[objectId]?.thumbUrl
      if (thumbUrl) {
        const imageHtml =
          `<img class="image" alt="{${objectId}}" src="${thumbUrl}" ` +
          `style="max-width: ${maxWidth}px; max-height: ${maxHeight}px; width: auto; height: auto;cursor: pointer;">`
        content = content.replaceAll(item, imageHtml)
      }
    })

    return content
  }

  const getImageFromContent = async (content) => {
    const imageIds = new Set()
    const matches = content.match(pattern)
    if (matches && matches.length > 0) {
      matches.forEach((item) => {
        let startIndex = item.indexOf('{')
        let endIndex = item.indexOf('}')
        const objectId = item.slice(startIndex + 1, endIndex)
        if (!image.value[objectId]) {
          imageIds.add(objectId)
        }
      })
    }
    if (imageIds.size > 0) {
      const res = await mtsImageService({ objectIds: [...imageIds].join(',') })
      res.data.data.forEach((item) => {
        imageStore().setImage(item) // 缓存image数据
      })
    }
  }

  return {
    image,
    setImage,
    imageTrans,
    getImageFromContent
  }
})
