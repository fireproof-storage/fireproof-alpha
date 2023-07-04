
// import validator capability
import { provide, create } from '@ucanto/server'
import { CAR } from '@ucanto/transport'
import { capability, Schema } from '@ucanto/validator'
import { ed25519 } from '@ucanto/principal'

const keypair = await ed25519.generate()

const echo = capability({
  can: 'test/echo',

  with: Schema.did(),
  nb: Schema.struct({
    echo: Schema.string()
  })
})

const theEcho = provide(echo, async ({ capability }) => {
  const { nb } = capability
  return {
    ok: `echo ${nb.echo}`
  }
})

const server = create({
  id: keypair.withDID('did:web:fireproof.storage'),
  codec: CAR.inbound,
  service: {
    test: {
      echo: theEcho
    }
  }

})

// console.log('server', server)

export { server }
