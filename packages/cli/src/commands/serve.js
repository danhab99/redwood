import fs from 'fs'
import path from 'path'

import chalk from 'chalk'
import execa from 'execa'
import terminalLink from 'terminal-link'

import { recordTelemetryAttributes } from '@redwoodjs/cli-helpers'

import { getPaths, getConfig } from '../lib'
import c from '../lib/colors'

export const command = 'serve [side]'
export const description = 'Run server for api or web in production'

function hasExperimentalServerFile() {
  const serverFilePath = path.join(getPaths().api.dist, 'server.js')
  return fs.existsSync(serverFilePath)
}

export const builder = async (yargs) => {
  yargs
    .usage('usage: $0 <side>')
    .command({
      command: '$0',
      description: 'Run both api and web servers',
      builder: (yargs) =>
        yargs.options({
          port: {
            default: getConfig().web?.port || 8910,
            type: 'number',
            alias: 'p',
          },
          socket: { type: 'string' },
        }),
      handler: async (argv) => {
        recordTelemetryAttributes({
          command: 'serve',
          port: argv.port,
          host: argv.host,
          socket: argv.socket,
        })

        // Run the experimental server file, if it exists, with web side also
        if (hasExperimentalServerFile()) {
          console.log(
            [
              separator,
              `🧪 ${chalk.green('Experimental Feature')} 🧪`,
              separator,
              'Using the experimental API server file at api/dist/server.js',
              separator,
            ].join('\n')
          )

          if (getConfig().experimental?.rsc?.enabled) {
            console.warn('')
            console.warn('⚠️ Skipping Fastify web server ⚠️')
            console.warn('⚠️ Using new RSC server instead ⚠️')
            console.warn('')
            await execa(
              'node',
              [
                '--conditions react-server',
                './node_modules/@redwoodjs/vite/dist/runRscFeServer.js',
              ],
              {
                cwd: getPaths().base,
                stdio: 'inherit',
                shell: true,
              }
            )
          } else if (getConfig().experimental?.streamingSsr?.enabled) {
            console.warn('')
            console.warn('⚠️ Skipping Fastify web server ⚠️')
            console.warn('⚠️ Using new Streaming FE server instead ⚠️')
            console.warn('')
            await execa('yarn', ['rw-serve-fe'], {
              cwd: getPaths().web.base,
              stdio: 'inherit',
              shell: true,
            })
          } else {
            await execa(
              'yarn',
              ['node', path.join('dist', 'server.js'), '--enable-web'],
              {
                cwd: getPaths().api.base,
                stdio: 'inherit',
                shell: true,
              }
            )
          }
          return
        }

        if (getConfig().experimental?.rsc?.enabled) {
          const { apiServerHandler } = await import('./serveHandler.js')
          // TODO (RSC) Allow specifying port, socket and apiRootPath
          const apiPromise = apiServerHandler({
            ...argv,
            port: 8911,
            apiRootPath: '/',
          })

          // TODO (RSC) More gracefully handle Ctrl-C
          const fePromise = execa(
            'node',
            [
              '--conditions react-server',
              './node_modules/@redwoodjs/vite/dist/runRscFeServer.js',
            ],
            {
              cwd: getPaths().base,
              stdio: 'inherit',
              shell: true,
            }
          )

          await Promise.all([apiPromise, fePromise])
        } else if (getConfig().experimental?.streamingSsr?.enabled) {
          const { apiServerHandler } = await import('./serveHandler.js')
          // TODO (STREAMING) Allow specifying port, socket and apiRootPath
          const apiPromise = apiServerHandler({
            ...argv,
            port: 8911,
            apiRootPath: '/',
          })

          // TODO (STREAMING) More gracefully handle Ctrl-C
          // Right now you get a big red error box when you kill the process
          const fePromise = execa('yarn', ['rw-serve-fe'], {
            cwd: getPaths().web.base,
            stdio: 'inherit',
            shell: true,
          })

          await Promise.all([apiPromise, fePromise])
        } else {
          // Wanted to use the new web-server package here, but can't because
          // of backwards compatibility reasons. With `bothServerHandler` both
          // the web side and the api side run on the same server with the same
          // port. If we use a separate fe server and api server we can't run
          // them on the same port, and so we lose backwards compatibility.
          // TODO: Use @redwoodjs/web-server when we're ok with breaking
          // backwards compatibility.
          const { bothServerHandler } = await import('./serveHandler.js')
          await bothServerHandler(argv)
        }
      },
    })
    .command({
      command: 'api',
      description: 'Start server for serving only the api',
      builder: (yargs) =>
        yargs.options({
          port: {
            default: getConfig().api?.port || 8911,
            type: 'number',
            alias: 'p',
          },
          socket: { type: 'string' },
          apiRootPath: {
            alias: ['api-root-path', 'rootPath', 'root-path'],
            default: '/',
            type: 'string',
            desc: 'Root path where your api functions are served',
            coerce: coerceRootPath,
          },
        }),
      handler: async (argv) => {
        recordTelemetryAttributes({
          command: 'serve',
          port: argv.port,
          host: argv.host,
          socket: argv.socket,
          apiRootPath: argv.apiRootPath,
        })

        // Run the experimental server file, if it exists, api side only
        if (hasExperimentalServerFile()) {
          console.log(
            [
              separator,
              `🧪 ${chalk.green('Experimental Feature')} 🧪`,
              separator,
              'Using the experimental API server file at api/dist/server.js',
              separator,
            ].join('\n')
          )
          await execa('yarn', ['node', path.join('dist', 'server.js')], {
            cwd: getPaths().api.base,
            stdio: 'inherit',
            shell: true,
          })
          return
        }

        const { apiServerHandler } = await import('./serveHandler.js')
        await apiServerHandler(argv)
      },
    })
    .command({
      command: 'web',
      description: 'Start server for serving only the web side',
      builder: (yargs) =>
        yargs.options({
          port: {
            default: getConfig().web?.port || 8910,
            type: 'number',
            alias: 'p',
          },
          socket: { type: 'string' },
          apiHost: {
            alias: 'api-host',
            type: 'string',
            desc: 'Forward requests from the apiUrl, defined in redwood.toml to this host',
          },
        }),
      handler: async (argv) => {
        recordTelemetryAttributes({
          command: 'serve',
          port: argv.port,
          host: argv.host,
          socket: argv.socket,
          apiHost: argv.apiHost,
        })

        if (getConfig().experimental?.streamingSsr?.enabled) {
          await execa('yarn', ['rw-serve-fe'], {
            cwd: getPaths().web.base,
            stdio: 'inherit',
            shell: true,
          })
        } else {
          await execa(
            'yarn',
            [
              'rw-web-server',
              '--port',
              argv.port,
              '--socket',
              argv.socket,
              '--api-host',
              argv.apiHost,
            ],
            {
              cwd: getPaths().base,
              stdio: 'inherit',
              shell: true,
            }
          )
        }
      },
    })
    .middleware((argv) => {
      recordTelemetryAttributes({
        command: 'serve',
      })

      // Make sure the relevant side has been built, before serving
      const positionalArgs = argv._

      if (
        positionalArgs.includes('web') &&
        !fs.existsSync(path.join(getPaths().web.dist), 'index.html')
      ) {
        console.error(
          c.error(
            '\n Please run `yarn rw build web` before trying to serve web. \n'
          )
        )
        process.exit(1)
      }

      if (
        positionalArgs.includes('api') &&
        !fs.existsSync(path.join(getPaths().api.dist))
      ) {
        console.error(
          c.error(
            '\n Please run `yarn rw build api` before trying to serve api. \n'
          )
        )
        process.exit(1)
      }

      if (
        // serve both
        positionalArgs.length === 1 &&
        (!fs.existsSync(path.join(getPaths().api.dist)) ||
          !fs.existsSync(path.join(getPaths().web.dist), 'index.html'))
      ) {
        console.error(
          c.error(
            '\n Please run `yarn rw build` before trying to serve your redwood app. \n'
          )
        )
        process.exit(1)
      }

      // Set NODE_ENV to production, if not set
      if (!process.env.NODE_ENV) {
        process.env.NODE_ENV = 'production'
      }
    })
    .epilogue(
      `Also see the ${terminalLink(
        'Redwood CLI Reference',
        'https://redwoodjs.com/docs/cli-commands#serve'
      )}`
    )
}

const separator = chalk.hex('#ff845e')(
  '------------------------------------------------------------------'
)

// We'll clean this up later, but for now note that this function is
// duplicated between this package and @redwoodjs/fastify
// to avoid importing @redwoodjs/fastify when the CLI starts.
export function coerceRootPath(path) {
  // Make sure that we create a root path that starts and ends with a slash (/)
  const prefix = path.charAt(0) !== '/' ? '/' : ''
  const suffix = path.charAt(path.length - 1) !== '/' ? '/' : ''

  return `${prefix}${path}${suffix}`
}
