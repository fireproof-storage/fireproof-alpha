import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { Text } from 'ink'
import { join } from 'path'
import { createReadStream } from 'fs'
import { parse } from '@jsonlines/core'
import { loadDatabase } from '../src/config.js'

/// Import data into a database
const Import = ({ database, filename }) => {
  const [stage, setStage] = useState('initializing')
  const [db, setDb] = useState(null)

  const loadFile = useCallback(() => {
    const fullFilePath = join(process.cwd(), filename)
    setStage('importing')
    const readableStream = createReadStream(fullFilePath)
    const parseStream = parse()
    readableStream.pipe(parseStream)
    parseStream.on('data', async (data) => {
      const ok = await db.put(data)
      console.log('put', ok)
    })
  }, [filename])

  const initDatabase = useCallback(() => {
    // use the database name to see if there is a directory in the root directory with that name
    // if not, create it
    setStage('loading')
    setDb(loadDatabase(database))
  }, [database])

  useEffect(() => {
    if (db) { loadFile() }
  }, [db])

  useEffect(() => {
    initDatabase()
  }, [])

  return <Text>Importing {filename} to {database}. Stage: {stage}</Text>
}

Import.propTypes = {
  /// Name of the database to use, will create if necessary
  database: PropTypes.string.isRequired,
  /// Path to a JSON file to import
  filename: PropTypes.string.isRequired
}
Import.positionalArgs = ['database', 'filename']

export default Import
