import { loadDatabase, loadData } from './config.js'

async function main () {
  const db = loadDatabase('test-todos')
  loadData(db, '../test/todos.json')
}

main()
