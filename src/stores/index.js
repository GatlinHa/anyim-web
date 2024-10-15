import { createPinia } from 'pinia'
import persist from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(persist)

export default pinia
export * from './user'
export * from './group'
export * from './setting'
export * from './message'
export * from './search'
