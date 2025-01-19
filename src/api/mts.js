import request from '@/js/utils/request'

export const mtsUploadService = (obj) => {
  return request.postForm('/mts/upload', obj)
}

export const mtsImageService = (obj) => {
  return request.get('/mts/image', { params: obj })
}
