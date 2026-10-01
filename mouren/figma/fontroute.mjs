// Отдаёт Golos Text из локальной копии вместо Google Fonts
import fs from 'fs'
const DIR = new URL('.', import.meta.url).pathname
export async function routeFonts(ctx) {
  await ctx.route(/fonts\.googleapis\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: fs.readFileSync(DIR + 'fonts/golos.css', 'utf8') }))
  await ctx.route(/fonts\.gstatic\.com/, (r) => {
    const f = DIR + 'fonts/' + new URL(r.request().url()).pathname.split('/').pop()
    return fs.existsSync(f) ? r.fulfill({ status: 200, contentType: 'font/woff2', body: fs.readFileSync(f), headers: { 'access-control-allow-origin': '*' } }) : r.abort()
  })
}
