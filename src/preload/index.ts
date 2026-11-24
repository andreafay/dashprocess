import { contextBridge, ipcRenderer } from 'electron'
import type { Api } from '@shared/types'

const api: Api = {
  stages: {
    list: () => ipcRenderer.invoke('stages:list'),
    create: (name) => ipcRenderer.invoke('stages:create', name),
    rename: (id, name) => ipcRenderer.invoke('stages:rename', id, name),
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
    setFiltersSidebar: (on) => ipcRenderer.invoke('settings:setFiltersSidebar', on)
  }
}

contextBridge.exposeInMainWorld('api', api)
