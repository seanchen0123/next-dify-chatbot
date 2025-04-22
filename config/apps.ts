import { AppList } from '../types/app'
import { defaultAppList as externalAppList } from './apps.data'

// 尝试导入外部应用列表，如果不存在则使用空数组
let defaultAppList: AppList = []
try {
  defaultAppList = externalAppList
} catch (error) {
  console.warn('未找到应用列表数据文件，使用空列表')
}

// 获取应用列表的函数，后续可以从API或其他来源获取
export const getAppList = (): AppList => {
  // 这里可以添加从API获取应用列表的逻辑
  // 目前返回默认列表
  return defaultAppList
}

// 检查是否有定义应用列表
export const hasDefinedAppList = (): boolean => {
  const appList = getAppList()
  return appList.length > 0
}