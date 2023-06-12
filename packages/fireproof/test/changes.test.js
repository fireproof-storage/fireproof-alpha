import { describe, it, beforeEach, afterEach } from 'mocha'
import assert from 'node:assert'
import { Fireproof } from '../src/fireproof.js'
import { Sync } from '../src/sync.js'
import { Database } from '../src/database.js'
import { join, dirname } from 'path'
import fs from 'fs'
import { readFileSync, writeFileSync } from 'node:fs'
import { startServer } from '../scripts/server.js'

import { resetTestDataDir, dbFiles, cpDir } from './helpers.js'

import { Filesystem } from '../src/storage/filesystem.js'

const SOURCE_DB_NAME = 'changes-fptest'
const TARGET_DB_NAME = 'changes-fptest-target'
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

describe('basic changes', () => {
  let sourceDb, targetDb, sourceStorage, targetStorage, car, server
  beforeEach(async () => {
    await sleep(10)
    await resetTestDataDir()
    // console.log('make db')
    sourceDb = Fireproof.storage(SOURCE_DB_NAME, {
      primary: {
        StorageClass: Filesystem
      }
    })
    // sourceDb.blocks.valet.primary = new Filesystem(SOURCE_DB_NAME)
    sourceStorage = sourceDb.blocks.valet.primary
    // console.log('sourceStorage', sourceStorage)
    // await sourceDb.ready

    // console.log('load data')
    await sourceDb.put({ _id: 'foo', bar: 'baz' })
    server = startServer()

    await sleep(10)

    // car = await Sync.makeCarSince(sourceDb, null, [])

    // const carTargetPath = join(sourceStorage.config.dataDir, TARGET_DB_NAME, `${car.cid}.car`)

    // await fs.promises.mkdir(dirname(carTargetPath), { recursive: true })

    // await fs.promises.writeFile(carTargetPath, car.bytes)

    // copy the header from main to branch
    // const copyHeaderPath = join(sourceStorage.config.dataDir, sourceDb.name, 'main.json')
    // const headerRaw = readFileSync(copyHeaderPath)
    // const copy2HeaderPath = join(sourceStorage.config.dataDir, TARGET_DB_NAME, 'changes.json')
    // writeFileSync(copy2HeaderPath, headerRaw)

    await sourceDb.addStorage({
      type: 'rest',
      url: 'http://localhost:8000/' + TARGET_DB_NAME
    })

    sleep(10)

    targetDb = Fireproof.storage(TARGET_DB_NAME, {
      primary: {
        StorageClass: Filesystem,
      }})
      

      // await targetDb.put({ _id: 'two', bar: 'ok' })
      // ,
    //   secondary: {
    //     type : 'rest',
    //     url: 'http://localhost:8000/' + TARGET_DB_NAME
    //   }
    // })

    // targetStorage = targetDb.blocks.valet.primary
  })
  afterEach(async () => {
    server.close()
    await sleep(10)
  })
  it('gets all docs', async () => {
    const response = await sourceDb.allDocuments()
    assert.equal(response.rows.length, 1)
    const doc = await sourceDb.get('foo')
    assert.equal(doc.bar, 'baz')
  }).timeout(10000)
  // it('creates car files', async () => {
  //   const files = await dbFiles(sourceStorage, SOURCE_DB_NAME)
  //   assert(files.length > 2)
  // })
  // it('creates target car file', async () => {
  //   const files = await dbFiles(targetStorage, TARGET_DB_NAME)
  //   assert(files.length == 2)
  //   assert.equal(files[0], `${car.cid}.car`)
  //   assert.equal(files[1], `changes.json`)
  //   assert.equal(car.cid.toString(), 'bafkreidpgtcocqbqg57hpmc7n7t52yzbositp7geq3dn3zygdxjtkattia')
  // })
  // it('instantiates target with key', async () => {
  //   await targetDb.ready
  //   console.log(targetStorage.headers)
  // })
  it('can read from target', async () => {
    const doc = await targetDb.get('foo')
    assert.equal(doc.bar, 'baz')
  })
})
