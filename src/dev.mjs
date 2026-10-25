import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));
const outputDirectory = path.resolve(sourceDirectory, '..', 'dist');
const port = Number(process.env.PORT || 4173);
const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.xml', 'application/xml; charset=utf-8'],
]);

const server = createServer(async (request, response) => {
  const requestPath = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  let relativePath = requestPath.replace(/^\/+/, '');
  if (!relativePath || requestPath.endsWith('/')) relativePath = path.join(relativePath, 'index.html');
  let target = path.resolve(outputDirectory, relativePath);
  const relativeTarget = path.relative(outputDirectory, target);

  if (relativeTarget.startsWith('..') || path.isAbsolute(relativeTarget)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  try {
    const targetStats = await stat(target);
    if (targetStats.isDirectory()) target = path.join(target, 'index.html');
  } catch {
    try {
      const cleanUrlTarget = path.resolve(outputDirectory, relativePath, 'index.html');
      await stat(cleanUrlTarget);
      target = cleanUrlTarget;
    } catch {
      target = path.join(outputDirectory, '404.html');
      response.statusCode = 404;
    }
  }

  response.setHeader('Content-Type', contentTypes.get(path.extname(target)) || 'application/octet-stream');
  createReadStream(target).pipe(response);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`B Socio is available at http://127.0.0.1:${port}`);
});
