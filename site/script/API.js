const list = document.querySelector('#anime-list');  // Находим контейнер для списка

var query = `
query ($page: Int, $perPage: Int) {
    Page (page: $page, perPage: $perPage) {
        media {
            id
            title {
                romaji
                english
            }
            startDate {
                year
            }
            coverImage {
                large
            }
        }
    }
}
`;

var variables = {
    page: 3,  // Первая страница
    perPage: 80  // Количество аниме на одну страницу
};

var url = 'https://graphql.anilist.co';
var options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    body: JSON.stringify({
        query: query,
        variables: variables
    })
};

fetch(url, options)
    .then(handleResponse)  // Обрабатываем ответ
    .then(handleData)      // Обрабатываем данные
    .catch(handleError);   // Обрабатываем ошибки

// Функция для обработки ответа
function handleResponse(response) {
    if (!response.ok) {
        throw new Error('Сетевая ошибка');
    }
    return response.json();  // Парсим ответ как JSON
}

// Функция для обработки данных
function handleData(data) {
    const media = data.data.Page.media;

    // Получаем случайные элементы из полученного массива аниме
    const randomAnime = getRandomItems(media, 12);  // Получаем 5 случайных аниме

    randomAnime.forEach(item => {
        const id = item.id;
        const title__r = item.title.romaji || item.title.english || 'Без названия';
        const year = item.startDate.year || 'Не указан';
        const poster = item.coverImage ? item.coverImage.large : 'Нет изображения';
        
        list.innerHTML += `
        <div class="card_title">
            <a href="page.html?id=${id}&title=${encodeURIComponent(title__r)}">
                <div class="poster">
                    <img src="${poster}" alt="${title__r}">
                </div>
                <div class="info">
                    <h2>${title__r}</h2>
                    <p>${year}</p>
                </div>
            </a>
        </div>`;
    });
}

// Функция для выбора случайных элементов из массива
function getRandomItems(arr, num) {
    const shuffled = arr.slice(0);  // Копируем массив, чтобы не изменять оригинальный
    let i = arr.length, randomIndex, tempValue;

    // Перемешиваем массив случайным образом (метод Фишера-Йетса)
    while (i--) {
        randomIndex = Math.floor(Math.random() * (i + 1));
        tempValue = shuffled[i];
        shuffled[i] = shuffled[randomIndex];
        shuffled[randomIndex] = tempValue;
    }

    return shuffled.slice(0, num);  // Возвращаем нужное количество случайных элементов
}

// Функция для обработки ошибок
function handleError(error) {
    console.error('Ошибка при получении данных:', error);  // Логируем ошибку
}
