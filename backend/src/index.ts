import { buildApp } from './app.js'

const start = async () => {
  const app = await buildApp()
  
  const port = parseInt(app.config.PORT, 10)
  const host = app.config.HOST

  try {
    await app.listen({ port, host })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }

  // Graceful shutdown handler
  const closeSignals = ['SIGINT', 'SIGTERM']
  closeSignals.forEach((signal) => {
    process.once(signal, async () => {
      app.log.info(`Received ${signal}, closing server gracefully...`)
      try {
        await app.close()
        app.log.info('Server closed successfully.')
        process.exit(0)
      } catch (closeErr) {
        app.log.error(closeErr as Error, 'Error during server shutdown')
        process.exit(1)
      }
    })
  })
}

start()
