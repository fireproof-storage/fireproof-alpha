<p align="center" >
  <a href="https://fireproof.storage/">
    <img src="https://fireproof.storage/static/img/logo-animated-black.svg" alt="Fireproof logo" width="200">
  </a>
</p>
<h3 align="center">
   Quickly add dynamic data to your React app
</h3>

<p align="center">
  <a href="https://github.com/fireproof-storage/fireproof/blob/main/packages/react/README.md">
    <img src="https://shields.io/badge/react-black?logo=react&style=for-the-badge%22" alt="React"  style="max-width: 100%;">
  </a>
  <a href="https://bundlephobia.com/package/use-fireproof">
    <img src="https://deno.bundlejs.com/?q=use-fireproof&treeshake=[*+as+useFireproof]&badge" alt="Bundle Size"  style="max-width: 100%;">
  </a>
</p>

Learn more about [the features and benefits of Fireproof](https://github.com/fireproof-storage/fireproof#readme) in the core repo. This README is for the React hooks.

## Quick Start

Using Fireproof in your React app is as easy as running:

```bash
npm install use-fireproof
```

Then in your app, you can use the top-level `useLiveQuery` hook to get access to the database and live query responses. Here's an example to-do list that initializes the database and sets up automatic refresh for query results. It also uses the `database.put` function to add new todos. With sync connected, the list of todos will redraw for all users in real-time. Here's the code:

```js
import { useLiveQuery } from 'use-fireproof';

export default TodoList = () => {
  const todos = useLiveQuery('date').docs;
  const database = useLiveQuery.database;
  const [newTodo, setNewTodo] = useState('');

  return (
    <div>
      <input type="text" onChange={(e) => setNewTodo(e.target.value)} />
      <button
        onClick={() =>
          database.put({ text: newTodo, date: Date.now(), completed: false })
        }
      >
        Save
      </button>
      <ul>
        {todos.map((todo) => (
          <li key={todo._id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => database.put({ ...todo, completed: !todo.completed })}
            />
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
};
```

This example shows calling `useLiveQuery` and `database.put`. It may be all you need to get started. You can [try out a running version here.](https://codepen.io/jchrisa/pen/vYVVxez?editors=0010)

## Hooks usage

### `useLiveQuery`

In your components, the `database` object and `useLiveQuery` hook are returned from the `useFireproof` hook. You can use the `useLiveQuery` hook to subscribe to query results, and automatically redraw when necessary. When sync is enabled you'll have both parties updating the same database in real-time. Here's an example of a simple shared to-do list. For something like a form you should use Live Document instead. There are two ways to call `useLiveQuery` - as a top-level hook, or based on the return value of `useFireproof`, which allows you to specifc the database name and replication options. Most apps will start with the top-level `useLiveQuery` hook, and then move to the lower-level API when they need more control.

```js
import { useLiveQuery } from 'use-fireproof';

export default TodoList = () => {
  const todos = useLiveQuery('date').docs
  ...
```

The top-level call (above) will use the default database name, and the default replication options. You can also call `useLiveQuery` with a database name and replication options, by instantiating the `useFireproof` hook directly. Here's an example that uses the lower-level API:

```js
import { useFireproof } from 'use-fireproof';

export default TodoList = () => {
  const { database, useLiveQuery } = useFireproof("my-todo-app")
  const todos = useLiveQuery('date').docs
  ...
```

This [running CodePen example](https://codepen.io/jchrisa/pen/vYVVxez?editors=0010) uses the `useLiveQuery` to display a list of todos, and the `database.put` function to add new todos. 

### `useDocument`

You can also subscribe directly to database updates, and automatically redraw when necessary. When sync is enabled you'll have both parties updating the same database in real-time. Here's an example of a simple shared text area (in real life you'd probably want to use an operational transform library like [Yjs](https://github.com/yjs/yjs) or [Automerge](https://automerge.org) for shared text areas, which both work great with Fireproof).

Just like useLiveQuery, you can call useDocument as a top-level hook, or based on the return value of useFireproof. Here's an example that uses the top-level hook:

```js
import { useDocument } from 'use-fireproof';

const CustomerProfile = ({ customerId }) => {
  const [doc, setDoc, saveDoc] = useDocument({
    _id: `${customerId}-profile`,
    name: "",
    company: "",
    startedAt: Date.now()
  });
  return (
    <div>
      <form>
        Name:
        <input
          type="text"
          value={doc.name}
          onChange={(e) => setDoc({ name: e.target.value })}
        />
        Company:
        <input
          type="text"
          value={doc.company}
          onChange={(e) => setDoc({ company: e.target.value })}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            saveDoc();
          }}
        >
          Save
        </button>
      </form>
          <p>Started at: {doc.startedAt}</p>
        <pre>{JSON.stringify(doc, null, 2)}</pre>
    </div>
  );
};
```

The top-level call (above) will use the default database name, and the default replication options. You can also call `useDocument` with a database name and replication options, by instantiating the `useFireproof` hook directly. Here's an example that uses the lower-level API:

```js
import { useFireproof } from 'use-fireproof';

const CustomerProfile = ({ customerId }) => {
  const { database, useDocument } = useFireproof("my-todo-app")
  const [doc, setDoc, saveDoc] = useDocument({
    _id: `${customerId}-profile`,
    name: "",
    company: "",
    createdAt: new Date()
  });
  ...
```

Another simple use case for Live Document is a shared form, where multiple users can edit the same document at the same time. For something like a chat room you should use Live Query instead:

```js
import { useDocument } from 'use-fireproof'

function MyComponent() {
  const [doc, setDoc, saveDoc] = useDocument({ _id : "my-doc-id" })

  return <input
          value={doc.text}
          onChange={(e) => setDoc({text : e.target.value});}
        /><button onClick={saveDoc}>Save</button>
}
```

## Using the `useFireproof` hook

The other top level hook, `useFireproof`, takes two optional setup function arguments, `defineDatabaseFn` and `setupDatabaseFn`. See below for examples.

The return value looks like `{ useLiveQuery, useDocument, database, ready }` where the `database` is the Fireproof instance that you can interact with using `put` and `get`, or via your indexes. The `ready` flag turns true after setup completes, you can use this to activate your UI. The `useLiveQuery` and `useDocument` functions are hooks used to update your app in real-time.

Changes made via remote sync peers, or other members of your cloud replica group will appear automatically if you use these APIs. Makes writing collaborative workgroup software, and multiplayer games super easy.


### Raw database subscription

Here is an example that uses direct database APIs instead of document and query hooks. You might see this in more complex applications that want to manage low-level details.

```js
import { useFireproof } from 'use-fireproof';

function MyComponent() {
  const { ready, database } = useFireproof();

  // set a default empty document
  const [doc, setDoc] = useState({});

  // run the loader on first mount
  useEffect(() => {
    const getDataFn = async () => {
      setDoc(await database.get('my-doc-id'));
    };
    getDataFn();
    return database.subscribe(getDataFn);
  }, [database]);

  // a function to change the value of the document
  const updateFn = async () => {
    await database.put({ _id: 'my-doc-id', hello: 'world', updated_at: new Date() });
  };

  // render the document with a click handler to update it
  return <pre onclick={updateFn}>{JSON.stringify(doc)}</pre>;
}
```

This should result in a tiny application that updates the document when you click it. In a real application you'd probably query an index to present eg. all of the photos in a gallery.

## Setup Functions

### `defineDatabaseFn`

Synchronous function that defines the database, run this before any async calls. You can use it to do stuff like set up Indexes. Here's an example:

```js
const defineIndexes = (database) => {
  new Index(database, 'allLists', function (doc, map) {
    if (doc.type === 'list') map(doc.type, doc);
  });
  new Index(database, 'todosByList', function (doc, map) {
    if (doc.type === 'todo' && doc.listId) {
      map([doc.listId, doc.createdAt], doc);
    }
  });
  window.fireproof = database; // 🤫 for dev
  return database;
};
```

### `setupDatabaseFn`

#### A note on using Context

If you are just calling `useLiveQuery` and `useDocument` and doing setup with the synchronous `defineDatabaseFn`, you may not need to manage context. If you are doing async setup work with `setupDatabaseFn` you will need to manage context. This allows you to run database setup code once for your entire app. Here is what you might see in App.js:

```js
import { FireproofCtx, useFireproof } from '@fireproof/core/hooks/use-fireproof';

function App() {
  // establish the Fireproof context value
  const fpCtxValue = useFireproof('dbname', defineIndexes, setupDatabase);

  // render the rest of the application wrapped in the Fireproof provider
  return (
    <FireproofCtx.Provider value={fpCtxValue}>
      <MyComponent />
    </FireproofCtx.Provider>
  );
}
```

An asynchronous function that uses the database when it's ready, run this to load fixture data, insert a dataset from somewhere else, etc. Here's a simple example:

```js
async function setupDatabase(database)) {
    const apiData = await (await fetch('https://dummyjson.com/products')).json()
    for (const product of apiData.products) {
        await database.put(product)
    }
}
```

If you are running the same setup across multiple users installations, you probably want to use deterministic randomness to generate the same data on each run, so people can sync together. Here is an example of generating deterministic fixtures, using `mulberry32` for deterministic randomness so re-runs give the same CID, avoiding unnecessary bloat at development time, taken from the TodoMVC demo app.

```js
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(1); // determinstic fixtures

export default async function loadFixtures(database) {
  const nextId = (prefix = '') => prefix + rand().toString(32).slice(2);
  const listTitles = ['Building Apps', 'Having Fun', 'Getting Groceries'];
  const todoTitles = [
    [
      'In the browser',
      'On the phone',
      'With or without Redux',
      'Login components',
      'GraphQL queries',
      'Automatic replication and versioning',
    ],
    ['Rollerskating meetup', 'Motorcycle ride', 'Write a sci-fi story with ChatGPT'],
    [
      'Macadamia nut milk',
      'Avocado toast',
      'Coffee',
      'Bacon',
      'Sourdough bread',
      'Fruit salad',
    ],
  ];
  let ok;
  for (let j = 0; j < 3; j++) {
    ok = await database.put({
      title: listTitles[j],
      type: 'list',
      _id: nextId('' + j),
    });
    for (let i = 0; i < todoTitles[j].length; i++) {
      await database.put({
        _id: nextId(),
        title: todoTitles[j][i],
        listId: ok.id,
        completed: rand() > 0.75,
        type: 'todo',
      });
    }
  }
}
```
