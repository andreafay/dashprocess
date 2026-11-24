import { ipcMain, nativeTheme } from 'electron'
import type { Filters, StagePreset, Theme } from '@shared/types'
import type { Language } from '@shared/i18n'
import * as repo from './repo'

export function registerIpc(): void {
  ipcMain.handle('stages:list', () => repo.listStages())
  ipcMain.handle('stages:create', (_e, name: string, preset: StagePreset | null) =>
    repo.createStage(name, preset)
  )
  ipcMain.handle('stages:rename', (_e, id: number, name: string) => repo.renameStage(id, name))
  ipcMain.handle('stages:resetName', (_e, id: number) => repo.resetStageName(id))
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
  ipcMain.on('settings:getLanguageSync', (e) => {
    e.returnValue = repo.getLanguage()
  })
  ipcMain.handle('settings:setLanguage', (_e, language: Language) => repo.setLanguage(language))
  ipcMain.on('settings:getFiltersSync', (e) => {
    e.returnValue = repo.getFilters()
  })
  ipcMain.handle('settings:setFilters', (_e, filters: unknown) => repo.setFilters(filters as Filters))
}
