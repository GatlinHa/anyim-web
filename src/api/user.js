import request from '@/utils/request'
import { CLIENT_TYPE, CLIENT_NAME, CLIENT_VERSION } from '@/const/userConst'

export const userRegisterService = ({ username, password }) => {
  request.post('/user/register', {
    account: username,
    nickName: '',
    password: password,
    clientType: CLIENT_TYPE,
    clientName: CLIENT_NAME,
    clientVersion: CLIENT_VERSION
  })
}
