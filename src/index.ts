import fastify, { FastifyReply, FastifyRequest } from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import httpProxy from '@fastify/http-proxy'
import axios from 'axios'
import { axiosInstance } from './api/axios'
import { createHash } from 'crypto'

let sessionToken: string = ''
let refreshToken: string = ''
let userId: string = ''

function hashPassword(password: string) {
  return createHash('sha256').update(password).digest('hex')
}

async function refreshAPIToken() {
  if (!refreshToken || !userId) {
    return
  }

  try {
    const { data } = await axiosInstance.post('refresh', {
      userId,
      refreshToken,
    })

    sessionToken = data.sessionToken
    refreshToken = data.refreshToken
    // console.log('API Token Refreshed:', new Date())
  } catch (error) {
    console.error('Error refreshing API token:', error)
  }
}

const server = fastify({ requestTimeout: 30000 })
server.register(cors, { origin: ['http://localhost:5173', 'https://ajax-reports.netlify.app'] })
server.register(helmet)
server.register(httpProxy, {
  upstream: 'https://api.ajax.systems/api/',
  prefix: '/api',
  preHandler: (request, _, next) => {
    request.headers['X-Api-Key'] = 'TIulbo0gre8eKjFtsBAWGMK/VDrIRxfE'
    request.headers['X-Session-Token'] = sessionToken
    next()
  },
})

server.get('/', async (request, reply) => {
  reply.send('Hello Fastify!')
})

server.post(
  '/login',
  async (
    request: FastifyRequest<{ Body: { email: string; password: string } }>,
    reply: FastifyReply
  ) => {
    const { email, password } = request.body

    try {
      const { data } = await axiosInstance.post('login', {
        login: email,
        passwordHash: hashPassword(password),
        userRole: 'USER',
      })
      sessionToken = data.sessionToken
      refreshToken = data.refreshToken
      userId = data.userId
      setInterval(refreshAPIToken, 12 * 60 * 1000)

      reply.send(data.userId)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response
        reply.status(status).send(data)
      } else {
        throw error
      }
    }
  }
)

const port = Number(process.env.PORT) || 3000
const host = 'RENDER' in process.env ? '0.0.0.0' : 'localhost'
server.listen({ host, port }, (err, address) => {
  if (err) {
    server.log.error(err)
    process.exit(1)
  }
  server.log.info(`Server is listening on port: ${address}`)
})
