import { ipcMain, nativeTheme } from 'electron'
import type { Filters, Theme } from '@shared/types'
import * as repo from './repo'

export function registerIpc(): void {
  ipcMain.handle('stages:list', () => repo.listStages())
  ipcMain.handle('stages:create', (_e, name: string) => repo.createStage(name))
  ipcMain.handle('stages:rename', (_e, id: number, name: string) => repo.renameStage(id, name))
  ipcMain.handle('stages:reorder', (_e, ids: number[]) => repo.reorderStages(ids))
  ipcMain.handle('stages:remove', (_e, id: number, moveTo: number | null) =>
    repo.deleteStage(id, moveTo)
  )

  ipcMain.handle('processes:list', () => repo.listProcesses())
  ipcMain.handle('processes:create', (_e, input) => repo.createProcess(input))
  ipcMain.handle('processes:update', (_e, id: number, input) => repo.updateProcess(id, input))
  ipcMain.handle('processes:remove', (_e, id: number) => repo.deleteProcess(id))
  ipcMain.handle('processes:move', (_e, id: number, stageId: number, index: number) =>
    repo.moveProcess(id, stageId, index)
  )

  ipcMain.handle('settings:getTheme', () => repo.getTheme())
  ipcMain.on('settings:getThemeSync', (e) => {
    e.returnValue = repo.getTheme()
  })
  ipcMain.handle('settings:setTheme', (_e, theme: Theme) => {
    repo.setTheme(theme)
    nativeTheme.themeSource = repo.getTheme()
  })
  ipcMain.on('settings:getFiltersSidebarSync', (e) => {
    e.returnValue = repo.getFiltersSidebar()
  })
  ipcMain.handle('settings:setFiltersSidebar', (_e, on: boolean) => repo.setFiltersSidebar(on))
  ipcMain.on('settings:getFiltersSync', (e) => {
    e.returnValue = repo.getFilters()
  })
  ipcMain.handle('settings:setFilters', (_e, filters: unknown) => repo.setFilters(filters as Filters))
}
