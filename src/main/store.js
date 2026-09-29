import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import { ipcMain } from 'electron'

function getDefaultConfigPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'espejo-config.json')
  }
  return path.join(__dirname, '../../build/espejo-config.json')
}

class AppStore {
  constructor() {
    this.storePath = path.join(app.getPath('userData'), 'espejo-config.json')
    this.data = this._load()
  }

  _load() {
    try {
      if (fs.existsSync(this.storePath)) {
        const raw = fs.readFileSync(this.storePath, 'utf8')
        return JSON.parse(raw)
      }

      const defaultPath = getDefaultConfigPath()
      if (fs.existsSync(defaultPath)) {
        const raw = fs.readFileSync(defaultPath, 'utf8')
        const data = JSON.parse(raw)
        const dir = path.dirname(this.storePath)
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true })
        }
        fs.writeFileSync(this.storePath, raw, 'utf8')
        return data
      }
    } catch (e) {
      console.error('[Store] Error loading config:', e.message)
    }
    return { hosts: [] }
  }

  _save() {
    try {
      const dir = path.dirname(this.storePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(this.storePath, JSON.stringify(this.data, null, 2), 'utf8')
    } catch (e) {
      console.error('[Store] Error saving config:', e.message)
    }
  }

  getHosts() {
    return this.data.hosts || []
  }

  saveHosts(hosts) {
    this.data.hosts = hosts
    this._save()
  }

  getHostById(id) {
    return (this.data.hosts || []).find(h => h.id === id)
  }
}

const store = new AppStore()

export function registerStoreHandlers() {
  ipcMain.handle('hosts:get', () => {
    return store.getHosts()
  })

  ipcMain.handle('hosts:save', (_, hosts) => {
    store.saveHosts(hosts)
    return true
  })
}

export function getHostById(id) {
  return store.getHostById(id)
}

export default store
