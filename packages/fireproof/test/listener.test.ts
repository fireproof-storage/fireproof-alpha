// @ts-nocheck

import { describe, it, beforeEach } from 'vitest';
import assert from 'node:assert';
import { TransactionBlockstore as Blockstore } from '../src/blockstore.js';
import { Fireproof } from '../src/fireproof.js';
import { Database } from '../src/database.js';
import { Listener } from '../src/listener.ts';

let database, listener, star;

describe('Listener', () => {
  beforeEach(async () => {
    database = new Database(new Blockstore(), []); // todo: these need a cloud name aka w3name, add this after we have cloud storage of blocks
    const docs = [
      // dave is first today
      { _id: 'd4s3b32a-3c3a', name: 'dave', age: 48 },
      { _id: 'a1s3b32a-3c3a', name: 'alice', age: 40 },
      { _id: 'b2s3b32a-3c3a', name: 'bob', age: 40 },
      { _id: 'c3s3b32a-3c3a', name: 'carol', age: 43 },
      { _id: 'e4s3b32a-3c3a', name: 'emily', age: 4 },
      { _id: 'f4s3b32a-3c3a', name: 'frank', age: 7 },
    ];
    for (const doc of docs) {
      const id = doc._id;
      const response = await database.put(doc);
      assert(response);
      assert(response.id, 'should have id');
      assert.equal(response.id, id);
    }
    listener = new Listener(database, function (doc, emit) {
      if (doc.name) {
        emit('person');
      }
    });
    star = new Listener(database);
  });
  it('all listeners get the reset event', async () => {
    let count = 0;
    const check = () => {
      count++;
      if (count === 3) return;
    };
    const startClock = database.clock;
    await database.put({ _id: 'k645-87tk', name: 'karl' });
    listener.on('person', check);
    listener.on('not-found', check);
    star.on('*', check);
    const ok = await database.put({ _id: 'k645-87tk', name: 'karl2' });
    assert(ok.id);
    assert.notEqual(database.clock, startClock);
    Fireproof.zoom(database, startClock);
  });

  it('can listen to all events', async () => {
    star.on('*', (key) => {
      assert.equal(key, 'i645-87ti');
      return;
    });
    const ok = await database.put({ _id: 'i645-87ti', name: 'isaac' });
    assert(ok.id);
  });
  it('shares only new events by default', async () => {
    listener.on('person', (key) => {
      assert.equal(key, 'g645-87tg');
      return;
    });
    try {
      const ok = await database.put({ _id: 'g645-87tg', name: 'gwen' });
      assert(ok.id);
    } catch (err) {
      console.log(err);
    }
  });
  it('shares all events if asked', async () => {
    let people = 0;
    listener.on(
      'person',
      (key) => {
        people++;
      },
      null
    );
    // this has to take longer than the database save operation
    // it's safe to make this number longer if it start failing
    await sleep(50);
    assert.equal(people, 6);
  });
  it('shares events since db.clock', async () => {
    const clock = database.clock;
    const afterEvent = () => {
      database.put({ _id: 'j645-87tj', name: 'jimmy' });
    };
    let people = 0;
    const newPerson = await database.put({ _id: 'h645-87th', name: 'harold' });
    assert(newPerson.id);
    listener.on(
      'person',
      (key) => {
        people++;
        if (people === 1) {
          assert.equal(key, 'h645-87th');
        } else {
          assert.equal(key, 'j645-87tj');
        }
        if (people === 1) afterEvent();
      },
      clock
    );
  });
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
