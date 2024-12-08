// Подключаем необходимые модули
const express = require('express');
const fs = require('fs').promises;
const mongoose = require('mongoose');

// Инициализируем Express
const app = express();

// Подключаемся к базе данных MongoDB
async function connectToDatabase() {
    try {
        await mongoose.connect('mongodb://localhost/mydatabase', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}

// Создаем схему пользователя
const Schema = mongoose.Schema;
const userSchema = new Schema({
    name: String,
    age: Number
});

// Создаем модель пользователя на основе схемы
const User = mongoose.model('User', userSchema);

// Роут для чтения файла
app.get('/read-file', async (req, res) => {
    try {
        const data = await fs.readFile('example.txt', 'utf8');
        res.send(`<pre>${data}</pre>`);  // Отправляем содержимое файла
    } catch (err) {
        res.status(500).send('Error reading file');
    }
});

// Роут для создания нового пользователя
app.get('/create-user', async (req, res) => {
    const newUser = new User({ name: 'John', age: 30 });
    await newUser.save();
    res.send('User saved!');
});

// Роут для главной страницы
app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

// Запускаем сервер
async function startServer() {
    await connectToDatabase();  // Подключаемся к базе данных перед запуском сервера
    const server = app.listen(3000, () => {
        console.log('Server is running on http://localhost:3000');
    });
}

startServer();  // Запускаем сервер
