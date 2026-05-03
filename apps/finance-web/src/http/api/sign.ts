import service from '../request'

export const apiSignIn = (params) => {
  return service.post('/user/login', params)
}

export const apiSignUp = (params) => {
  return service.post('/user/register', params)
}

export const apiSendOpt = (params) => {
  return service.post('/user/verifyCode', params)
}

export const apiGetUserInfo = () => {
  return service.get('/user/profile')
}
