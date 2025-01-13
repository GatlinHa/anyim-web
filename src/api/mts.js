import request from '@/js/utils/request'
import { getReqBody } from '@/api/common'

export const mtsUploadService = (obj) => {
  return request.postForm('/mts/upload', getReqBody(obj))
}
