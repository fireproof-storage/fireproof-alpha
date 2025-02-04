import { useEffect, useState, useCallback, createContext } from 'react';
import { Database, Fireproof, Index } from '@fireproof/core';

interface Document {
  _id: string;
  [key: string]: any;
}

export interface FireproofCtxValue {
  database: Database;
  useLiveQuery: Function;
  useDocument: Function;
  ready: boolean;
}

export const FireproofCtx = createContext<FireproofCtxValue>({} as FireproofCtxValue);

const databases = new Map<string, { database: Database; setupStarted: Boolean }>();

const initializeDatabase = (
  name: string|Database,
  defineDatabaseFn: Function,
  config: any,
): { database: Database; setupStarted: Boolean } => {
  if (typeof name['name'] === 'string' ) {
    const theName = name['name'] as string;
    const theDb = name as Database;
    if (databases.has(theName)) {
      return databases.get(theName) as { database: Database; setupStarted: Boolean };
    } else {
      defineDatabaseFn(theDb);
      const obj = { database: theDb, setupStarted: false };
      databases.set(theName, obj);
      return obj;
    }
  } else {
    if (typeof name !== 'string') throw new Error('Database name must be a string')
    if (databases.has(name)) {
      return databases.get(name) as { database: Database; setupStarted: Boolean };
    } else {
      const database = Fireproof.storage(name, config);
      defineDatabaseFn(database);
      const obj = { database, setupStarted: false };
      databases.set(name, obj);
      return obj;
    }
  }
};

/**
 * Top level hook to initialize a Fireproof database and a query for it.
 * Uses default db name 'useFireproof'.
 */
const topLevelUseLiveQuery = (...args) => {
  const { useLiveQuery, database } = useFireproof();
  // @ts-ignore
  topLevelUseLiveQuery.database = database;
  return useLiveQuery(...args);
};

export const useLiveQuery = topLevelUseLiveQuery;

/**
 * Top level hook to initialize a Fireproof database and a document for it.
 * Uses default db name 'useFireproof'.
 */
const topLevelUseLiveDocument = (...args) => {
  const { useDocument, database } = useFireproof();
  // @ts-ignore
  topLevelUseLiveQuery.database = database;
  return useDocument(...args);
};

export const useDocument = topLevelUseLiveDocument;

// export { useLiveQuery };

/**
@function useFireproof
React hook to initialize a Fireproof database.
You might need to import { nodePolyfills } from 'vite-plugin-node-polyfills' in your vite.config.ts
@param {string|Database} name - The path to the database file
@param {function(database: Database): void} [defineDatabaseFn] - Synchronous function that defines the database, run this before any async calls
@param {function(database: Database): Promise<void>} [setupDatabaseFn] - Asynchronous function that sets up the database, run this to load fixture data etc
@returns {FireproofCtxValue} { useLiveQuery, useDocument, database, ready }
*/
export function useFireproof(
  name = 'useFireproof',
  defineDatabaseFn = (database: Database) => {
    // define indexes here before querying them in setup
    database;
  },
  setupDatabaseFn: Function | null = null,
  config = {},
): FireproofCtxValue {
  // console.log('useFireproof', name, defineDatabaseFn, setupDatabaseFn);
  const [ready, setReady] = useState(false);
  const init = initializeDatabase(name, defineDatabaseFn, config);
  const database = init.database;

  useEffect(() => {
    const doSetup = async () => {
      if (ready || init.setupStarted) return;
      // console.log('Setting up database', name);
      init.setupStarted = true;
      if (setupDatabaseFn && database.clock.length === 0) {
        // console.log('setupDatabaseFn', name, setupDatabaseFn);
        await setupDatabaseFn(database);
      }
      setReady(true);
    };
    doSetup();
  }, [name]);

  function useDocument(initialDoc: Document) {
    const id = initialDoc._id;
    const [doc, setDoc] = useState(initialDoc);

    const saveDoc = useCallback(
      async () => await database.put({ ...doc, _id: id }),
      [id, doc],
    );

    const refreshDoc = useCallback(async () => {
      // todo add option for mvcc checks
      setDoc(await database.get(id).catch(() => initialDoc));
    }, [id, initialDoc]);

    useEffect(
      <React.EffectCallback>(() =>
        database.subscribe((changes: { key: string; id: string }[]) => {
          if (changes.find((c) => c.key === id)) {
            refreshDoc(); // todo use change.value
          }
        })),
      [id, refreshDoc],
    );

    useEffect(() => {
      refreshDoc();
    }, []);

    return [
      doc,
      (newDoc) => {
        if (newDoc) return setDoc((d) => ({ ...d, ...newDoc }));
        else return setDoc(initialDoc);
      },
      saveDoc,
    ];
  }

  function useLiveQuery(mapFn: Function, query = {}, initialRows: any[] = []) {
    const [result, setResult] = useState({
      rows: initialRows,
      proof: {},
      docs: initialRows.map((r) => r.doc),
    });
    const [index, setIndex] = useState<Index | null>(null);

    const refreshRows = useCallback(async () => {
      if (index) {
        const res = await index.query(query);
        setResult({ ...res, docs: res.rows.map((r) => r.doc) });
      }
    }, [index, JSON.stringify(query)]);

    useEffect(
      <React.EffectCallback>(() =>
        database.subscribe(() => {
          refreshRows();
        })),
      [database, refreshRows],
    );

    useEffect(() => {
      refreshRows();
    }, [index]);

    useEffect(() => {
      setIndex(new Index(database, null, mapFn));
    }, [mapFn.toString()]);

    return result;
  }

  return {
    useLiveQuery,
    // useLiveDocument : useDocument,
    useDocument,
    database,
    ready,
  };
}
