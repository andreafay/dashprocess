import { contextBridge, ipcRenderer } from 'electron'
import type { Api } from '@shared/types'

const api: Api = {
  stages: {
    list: () => ipcRenderer.invoke('stages:list'),
    create: (name, preset) => ipcRenderer.invoke('stages:create', name, preset),
    rename: (id, name) => ipcRenderer.invoke('stages:rename', id, name),
    resetName: (id) => ipcRenderer.invoke('stages:resetName', id),
    reorder: (ids) => ipcRenderer.invoke('stages:reorder', ids),
    remove: (id, moveTo) => ipcRenderer.invoke('stages:remove', id, moveTo)
  },
  processes: {
    list: () => ipcRenderer.invoke('processes:list'),
    create: (input) => ipcRenderer.invoke('processes:create', input),
    update: (id, input) => ipcRenderer.invoke('processes:update', id, input),
    remove: (id) => ipcRenderer.invoke('processes:remove', id),
    move: (id, stageId, index) => ipcRenderer.invoke('processes:move', id, stageId, index)
  },
  settings: {
    initialTheme: ipcRenderer.sendSync('settings:getThemeSync'),
    getTheme: () => ipcRenderer.invoke('settings:getTheme'),
    setTheme: (theme) => ipcRenderer.invoke('settings:setTheme', theme),
    initialFiltersSidebar: ipcRenderer.sendSync('settings:getFiltersSidebarSync'),
    setFiltersSidebar: (on) => ipcRenderer.invoke('settings:setFiltersSidebar', on),
    initialShowEnded: ipcRenderer.sendSync('settings:getShowEndedSync'),
    setShowEnded: (on) => ipcRenderer.invoke('settings:setShowEnded', on),
    initialFilters: ipcRenderer.sendSync('settings:getFiltersSync'),
    initialLanguage: ipcRenderer.sendSync('settings:getLanguageSync'),
    setLanguage: (language) => ipcRenderer.invoke('settings:setLanguage', language),
    setFilters: (filters) => ipcRenderer.invoke('settings:setFilters', filters)
  }
}

contextBridge.exposeInMainWorld('api', api)
