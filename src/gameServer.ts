import http from 'http';

export const gameServer = http.createServer((req, res) => {
  res.end('Hello Node');
});
