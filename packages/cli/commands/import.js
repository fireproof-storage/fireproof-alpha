import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Text } from 'ink'

/// Import data into a database
const Import = ({ database, file }) => {
  return <Text>Importing {file} to {database}</Text>
}

Import.propTypes = {
  /// Name of the database to use, will create if necessary
  database: PropTypes.string.isRequired,
  /// Path to a JSON file to import
  file: PropTypes.string.isRequired
}
Import.positionalArgs = ['database', 'file']

export default Import
