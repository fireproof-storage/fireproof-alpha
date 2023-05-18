import { Fireproof } from '@fireproof/core'
import { readFileSync } from 'fs'
import { join } from 'path'

const config = {
  dataDir: '~/.fireproof'
}

export function loadDatabase (database) {
  const clock = loadClock(database)
  if (clock) {
    throw new Error(`Database ${database} already exists`)
  } else {
    return Fireproof.storage(database)
  }
}

function loadClock (database) {
  const clockFile = join(config.dataDir, database, 'clock.json')
  let clock
  try {
    clock = JSON.parse(readFileSync(clockFile, 'utf8'))
  } catch (err) {
    clock = null
  }
  return clock
}
