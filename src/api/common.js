import { CLIENT_TYPE, CLIENT_NAME, CLIENT_VERSION } from '@/const/userConst'

export const getReqBody = (obj) => {
  return {
    ...obj,
    clientType: CLIENT_TYPE,
    clientName: CLIENT_NAME,
    clientVersion: CLIENT_VERSION
  }
}
