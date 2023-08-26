import axios from 'axios'

export const axiosInstance = axios.create({
  baseURL: 'https://api.ajax.systems/api/',
})

axiosInstance.interceptors.request.use((config) => {
  config.headers['X-Api-Key'] = 'TIulbo0gre8eKjFtsBAWGMK/VDrIRxfE'
  return config
})
