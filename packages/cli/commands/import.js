import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { Text } from 'ink'
import { join } from 'path'
import { createReadStream } from 'fs'
import { parse } from '@jsonlines/core'

// import { readFile } from 'fs/promises'

/// Import data into a database
const Import = ({ database, filename }) => {
  const [stage, setStage] = useState('initializing')

  const loadFile = useCallback(() => {
    const fullFilePath = join(process.cwd(), filename)
    setStage('loading')
    const readableStream = createReadStream(fullFilePath)
    const parseStream = parse()
    readableStream.pipe(parseStream)
    parseStream.on('data', (data) => {

    })
  }, [filename])

  useEffect(() => {
    // load the file from the filesystem, based on the file path and the directory the user is running the command from
    // parse the file as JSON
    loadFile()
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
