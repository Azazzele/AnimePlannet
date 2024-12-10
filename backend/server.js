const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { ExtractJwt, Strategy } = require('passport-jwt');
const path = require('path');
const { check, validationResult } = require('express-validator');
const cors = require('cors');
require('dotenv').config(); // Для загрузки .env файла

const app = express();
const PORT = process.env.PORT || 3000;

// Мокированные пользователи для демонстрации
const users = [];

// Парсер тела запроса
app.use(bodyParser.json());

// Настройка CORS (для работы с фронтендом на другом домене)
app.use(cors());

// Стратегия для Passport для проверки JWT
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(new Strategy(jwtOptions, (jwtPayload, done) => {
  const user = users.find(user => user.username === jwtPayload.username);
  if (user) {
    return done(null, user);
  } else {
    return done(null, false);
  }
}));

app.use(passport.initialize());

// Функция для создания пользователя с хэшированием пароля
function createUser(username, password) {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  const user = { id: users.length + 1, username, password: hashedPassword };
  users.push(user);
  return user;
}

// Функция для получения пользователя по имени
function getUser(username) {
  return users.find(user => user.username === username);
}

// Обслуживание статических файлов (index.html и т.д.)
app.use(express.static(path.join(__dirname, '..')));  // Указывает на папку выше для статических файлов

// Регистрация нового пользователя с валидацией данных
app.post('/register', [
  check('username').not().isEmpty().withMessage('Имя пользователя обязательно'),
  check('password').isLength({ min: 6 }).withMessage('Пароль должен содержать хотя бы 6 символов'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  if (getUser(username)) {
    return res.status(400).json({ message: 'Пользователь с таким именем уже существует' });
  }

  const newUser = createUser(username, password);
  res.status(201).json({ message: 'Пользователь зарегистрирован', user: { id: newUser.id, username: newUser.username } });
});

// Логин и создание JWT с валидацией
app.post('/login', [
  check('username').not().isEmpty().withMessage('Имя пользователя обязательно'),
  check('password').not().isEmpty().withMessage('Пароль обязателен'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;
  const user = getUser(username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
  }

  const payload = { username: user.username };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ message: 'Успешный вход', token });
});

// Защищённый маршрут
app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ message: 'Вы вошли в защищённый маршрут', user: req.user });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
