import './newanime.js';
import './birthday.js';
import './navbar.js';

const list = document.querySelector('#anime-list');
const listNew = document.querySelector('#anime-list-new');
const recommendationContainer = document.querySelector('#anime-recommendations');

const query = `
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
                month
            }
            format
            coverImage {
                large
            }
            genres
            averageScore
            studios {
                nodes {
                    name
                }
            }
            recommendations {
                edges {
                    node {
                        media {
                            id
                            title {
                                native
                            }
                            startDate {
                                year
                            }
                            coverImage {
                                extraLarge
                            }
                        }
                    }
                }
            }
        }
    }
}
`;

const variables = {
    page: 1,
    perPage: 1000,
};

const url = 'https://graphql.anilist.co';
const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    body: JSON.stringify({
        query: query,
        variables: variables,
    }),
};

fetch(url, options)
    .then(handleResponse)
    .then(handleData)
    .catch(handleError);

function handleResponse(response) {
    if (!response.ok) {
        throw new Error('Сетевая ошибка');
    }
    return response.json(); 
}

function handleData(data) {
    const media = data.data.Page.media;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Функция для определения текущего сезона по месяцу
    function getCurrentSeason(month) {
        if (month >= 3 && month <= 5) {
            return 'spring';
        } else if (month >= 6 && month <= 8) {
            return 'summer';
        } else if (month >= 9 && month <= 11) {
            return 'fall';
        } else {
            return 'winter';
        }
    }

    const currentSeason = getCurrentSeason(currentMonth);

    // Фильтруем аниме, выпущенные в текущем году и сезоне
    const newAnime = media.filter(item => {
        const itemYear = item.startDate.year;
        const itemMonth = item.startDate.month;
        return itemYear === currentYear && isInSeason(itemMonth, currentSeason);
    });

    // Фильтруем популярные аниме
    const popularAnime = media.filter(item => item.averageScore >= 70);

    // Фильтруем топовые аниме по рейтингу
    const topRatedAnime = media.filter(item => item.averageScore >= 85);

    // Выбираем случайные аниме для популярных и топовых
    const randomPopularAnime = getRandomItems(popularAnime, 14);

    // Составляем список рекомендаций
    const recommendations = media.reduce((acc, item) => {
        if (item.recommendations.edges.length > 0) {
            item.recommendations.edges.forEach(recommendation => {
                const recommendedAnime = recommendation.node.media;
                acc.push({
                    title: recommendedAnime.title.romaji || recommendedAnime.title.native || 'Без названия',
                    coverImage: recommendedAnime.coverImage?.extraLarge || 'default-image.jpg',
                    id: recommendedAnime.id
                });
            });
        }
        return acc;
    }, []);

    // Генерация карточки аниме
    function createAnimeCard(item) {
        const id = item.id;
        const title = item.title.romaji || item.title.english || 'Без названия';
        const year = item.startDate?.year || 'Не указан';
        const poster = item.coverImage?.large || 'default-image.jpg';
        const format = item.format || 'Не указан';

        const cardElement = document.createElement('div');
        cardElement.classList.add('card_title');

        cardElement.innerHTML = `
            <div class="wrapper">
                <a href="page.html?id=${id}&title=${encodeURIComponent(title)}">
                    <div class="poster">
                        <img src="${poster}" alt="${title}">
                    </div>
                    <div class="info">
                        <h2>${title}</h2>
                        <p>${year}</p>
                        <p>${format}</p>
                    </div>
                </a>
            </div>
        `;

        return cardElement;
    }

    // Универсальная функция для отображения аниме
    function displayAnime(container, animeList) {
        container.innerHTML = ''; // Очистить контейнер перед добавлением новых элементов
        animeList.forEach(item => {
            container.appendChild(createAnimeCard(item));
        });
    }

    // Отображаем новинки
    displayAnime(listNew, newAnime);

    // Отображаем случайные популярные аниме
    displayAnime(list, randomPopularAnime);

    // Отображаем рекомендации, если они есть
    if (recommendations.length > 0) {
        displayAnime(recommendationContainer, recommendations);
    }
}

// Функция для выбора случайных элементов из массива
function getRandomItems(arr, num) {
    const shuffled = arr.slice(0); // Копируем массив, чтобы не изменять оригинальный
    let i = arr.length;
    let randomIndex, tempValue;

    // Перемешиваем массив случайным образом (метод Фишера-Йетса)
    while (i--) {
        randomIndex = Math.floor(Math.random() * (i + 1));
        tempValue = shuffled[i];
        shuffled[i] = shuffled[randomIndex];
        shuffled[randomIndex] = tempValue;
    }

    return shuffled.slice(0, num);
}

// Функция для определения, попадает ли месяц в текущий сезон
function isInSeason(month, season) {
    switch (season) {
        case 'spring':
            return month >= 3 && month <= 5;
        case 'summer':
            return month >= 6 && month <= 8;
        case 'fall':
            return month >= 9 && month <= 11;
        case 'winter':
            return month === 12 || month <= 2;
        default:
            return false;
    }
}

// Обработка ошибок
function handleError(error) {
    console.error('Ошибка при загрузке данных:', error);

    const errorMessage = document.createElement('div');
    errorMessage.classList.add('error-message');
    errorMessage.textContent = 'Произошла ошибка при загрузке данных, пожалуйста, попробуйте позже.';
    document.body.appendChild(errorMessage);
}
