const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createServer } = require('../server');

function request(server, method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        port: server.address().port,
        hostname: '127.0.0.1',
        path,
        method,
        headers: data ? { 'Content-Type': 'application/json' } : undefined,
      },
      (res) => {
        let responseData = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, body: responseData });
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

test('CRUD users flow', async () => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    const initial = await request(server, 'GET', '/users');
    assert.equal(initial.statusCode, 200);
    assert.deepEqual(JSON.parse(initial.body), []);

    const created = await request(server, 'POST', '/users', {
      name: 'Alice',
      email: 'alice@example.com',
    });
    assert.equal(created.statusCode, 201);
    const createdUser = JSON.parse(created.body);
    assert.equal(createdUser.name, 'Alice');
    assert.equal(createdUser.email, 'alice@example.com');

    const fetched = await request(server, 'GET', `/users/${createdUser.id}`);
    assert.equal(fetched.statusCode, 200);
    assert.equal(JSON.parse(fetched.body).name, 'Alice');

    const updated = await request(server, 'PUT', `/users/${createdUser.id}`, {
      name: 'Alice Updated',
      email: 'alice.updated@example.com',
    });
    assert.equal(updated.statusCode, 200);
    const updatedUser = JSON.parse(updated.body);
    assert.equal(updatedUser.name, 'Alice Updated');

    const removed = await request(server, 'DELETE', `/users/${createdUser.id}`);
    assert.equal(removed.statusCode, 200);
    assert.equal(JSON.parse(removed.body).message, 'User deleted');

    const afterDelete = await request(server, 'GET', '/users');
    assert.deepEqual(JSON.parse(afterDelete.body), []);
  } finally {
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
});
