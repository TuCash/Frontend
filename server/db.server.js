const path = require('path');
const jsonServer = require('json-server');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults({ static: path.join(__dirname, 'public') });

server.use(middlewares);
server.use(jsonServer.bodyParser);

const createToken = user => Buffer.from(`${user.id}:${user.email}`).toString('base64');

server.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing name, email or password' });
  }

  const users = router.db.get('users');
  const existing = users.find({ email }).value();

  if (existing) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const user = {
    id: Date.now(),
    name,
    email,
    password,
    createdAt: new Date().toISOString(),
  };

  users.push(user).write();

  return res.status(201).json({
    token: createToken(user),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

server.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password' });
  }

  const user = router.db.get('users').find({ email }).value();

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  return res.json({
    token: createToken(user),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

server.post('/auth/forgot-password', (req, res) => {
  const { email } = req.body || {};
  const user = router.db.get('users').find({ email }).value();

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({ message: 'Password reset instructions sent' });
});

server.use((req, res, next) => {
  if (req.headers.authorization) {
    return next();
  }

  if (req.method === 'GET') {
    return next();
  }

  return res.status(401).json({ message: 'Authorization header missing' });
});

server.use(router);

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Mock API is running on http://localhost:${port}`);
});
