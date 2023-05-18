import { Fireproof } from '@fireproof/core'
import { readFileSync, createReadStream } from 'fs'
import { join } from 'path'
import { parse } from '@jsonlines/core'

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

export function loadData (database, filename) {
  const fullFilePath = join(process.cwd(), filename)
  const readableStream = createReadStream(fullFilePath)
  const parseStream = parse()
  readableStream.pipe(parseStream)
  parseStream.on('data', async (data) => {
    const ok = await database.put(data)
    console.log('put', ok)
  })
}
