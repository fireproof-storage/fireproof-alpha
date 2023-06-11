import { describe, it, beforeEach, afterEach } from 'mocha'
import assert from 'node:assert'
import { Fireproof } from '../src/fireproof.js'
import { join } from 'path'
import { readFileSync, writeFileSync } from 'node:fs'


import { resetTestDataDir, dbFiles, cpDir } from './helpers.js'

import { Filesystem } from '../src/storage/filesystem.js'

const TEST_DB_NAME = 'changes-fptest'
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

describe('basic changes', () => {
  let db, storage
  beforeEach(async () => {
    await sleep(10)
    await resetTestDataDir()
    // console.log('make db')
    db = Fireproof.storage(TEST_DB_NAME, {
      primary: { StorageClass: Filesystem }
    })
    // db.blocks.valet.primary = new Filesystem(TEST_DB_NAME)
    storage = db.blocks.valet.primary
    // console.log('storage', storage)
    // await db.ready

    // console.log('load data')
    await db.put({ _id: 'foo', bar: 'baz' })
    await sleep(10)
  })
  it('gets all docs', async () => {
    const response = await db.allDocuments()
    assert.equal(response.rows.length, 1)
    const doc = await db.get('foo')
    assert.equal(doc.bar, 'baz')
  }).timeout(10000)
  it('creates car files', async () => {
    const files = await dbFiles(storage, TEST_DB_NAME)
    assert(files.length > 2)
  })
})