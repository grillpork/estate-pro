import { Hono } from 'hono'

const app = new Hono()

app.get('/muping', (c) => {
  return c.text('Hello Muping!')
})

export default app
