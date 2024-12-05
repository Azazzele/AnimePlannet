import './newanime.js'
import './birthday.js'

const list = document.querySelector('#anime-list') // Список всех аниме
const listNew = document.querySelector('#anime-list-new') // Список новинок
const listPopular = document.querySelector('#anime-list-popular') // Список популярных аниме
const listTopRated = document.querySelector('#anime-list-top-rated') // Список лучших по рейтингу аниме
const listAction = document.querySelector('#anime-list-action') // Список экшен-аниме
const listDrama = document.querySelector('#anime-list-drama') // Список драм-аниме
const listStudios = document.querySelector('#anime-list-studios') // Список аниме по студиям

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
            }
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
        }
    }
}
`

const variables = {
	page: 1, // Первая страница
	perPage: 1000, // Количество аниме на одну страницу
}

const url = 'https://graphql.anilist.co'
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
}

fetch(url, options)
	.then(handleResponse) // Обрабатываем ответ
	.then(handleData) // Обрабатываем данные
	.catch(handleError) // Обрабатываем ошибки

// Функция для обработки ответа
function handleResponse(response) {
	if (!response.ok) {
		throw new Error('Сетевая ошибка')
	}
	return response.json() // Парсим ответ как JSON
}

// Функция для обработки данных
function handleData(data) {
	const media = data.data.Page.media
	const currentYear = new Date().getFullYear()

	// Фильтруем аниме, выпущенные в текущем году
	const newAnime = media.filter(
		item => item.startDate && item.startDate.year === currentYear
	)

	// Фильтруем популярные аниме
	const popularAnime = media.filter(item => item.averageScore >= 70) // Порог популярности (можно настроить)

	// Фильтруем топовые аниме по рейтингу
	const topRatedAnime = media.filter(item => item.averageScore >= 85) // Порог рейтинга

	// Фильтруем аниме по жанрам
	const actionAnime = media.filter(item => item.genres.includes('Action'))
	const dramaAnime = media.filter(item => item.genres.includes('Drama'))

	// Фильтруем аниме по студиям (например, Studio Bones)
	const studiosAnime = media.filter(item => item.studios && item.studios.nodes.some(studio => studio.name === 'Bones'))

	// Выбираем случайные аниме
	const randomAnime = getRandomItems(media, 7)

	// Отображаем новинки (аниме, выпущенные в текущем году)
	newAnime.forEach(item => {
		const id = item.id
		const title = item.title.romaji || item.title.english || 'Без названия'
		const year = item.startDate.year || 'Не указан'
		const poster = item.coverImage ? item.coverImage.large : 'default-image.jpg'

		listNew.innerHTML += `
            <div class="card_title">
                <div class="wrapper">
                    <a href="page.html?id=${id}&title=${encodeURIComponent(
			title
		)}">
                        <div class="poster">
                            <img src="${poster}" alt="${title}">
                        </div>
                        <div class="info">
                            <h2>${title}</h2>
                            <p>${year}</p>
                        </div>
                    </a>
                </div>
            </div>`
	})

	// Отображаем популярные аниме
	popularAnime.forEach(item => {
		const id = item.id
		const title = item.title.romaji || item.title.english || 'Без названия'
		const year = item.startDate.year || 'Не указан'
		const poster = item.coverImage ? item.coverImage.large : 'default-image.jpg'

		listPopular.innerHTML += `
            <div class="card_title">
                <div class="wrapper">
                    <a href="page.html?id=${id}&title=${encodeURIComponent(
			title
		)}">
                        <div class="poster">
                            <img src="${poster}" alt="${title}">
                        </div>
                        <div class="info">
                            <h2>${title}</h2>
                            <p>${year}</p>
                        </div>
                    </a>
                </div>
            </div>`
	})

	// Отображаем топовые аниме по рейтингу
	topRatedAnime.forEach(item => {
		const id = item.id
		const title = item.title.romaji || item.title.english || 'Без названия'
		const year = item.startDate.year || 'Не указан'
		const poster = item.coverImage ? item.coverImage.large : 'default-image.jpg'

		listTopRated.innerHTML += `
            <div class="card_title">
                <div class="wrapper">
                    <a href="page.html?id=${id}&title=${encodeURIComponent(
			title
		)}">
                        <div class="poster">
                            <img src="${poster}" alt="${title}">
                        </div>
                        <div class="info">
                            <h2>${title}</h2>
                            <p>${year}</p>
                        </div>
                    </a>
                </div>
            </div>`
	})

	// Отображаем экшен-аниме
	actionAnime.forEach(item => {
		const id = item.id
		const title = item.title.romaji || item.title.english || 'Без названия'
		const year = item.startDate.year || 'Не указан'
		const poster = item.coverImage ? item.coverImage.large : 'default-image.jpg'

		listAction.innerHTML += `
            <div class="card_title">
                <div class="wrapper">
                    <a href="page.html?id=${id}&title=${encodeURIComponent(
			title
		)}">
                        <div class="poster">
                            <img src="${poster}" alt="${title}">
                        </div>
                        <div class="info">
                            <h2>${title}</h2>
                            <p>${year}</p>
                        </div>
                    </a>
                </div>
            </div>`
	})

	// Отображаем драм-аниме
	dramaAnime.forEach(item => {
		const id = item.id
		const title = item.title.romaji || item.title.english || 'Без названия'
		const year = item.startDate.year || 'Не указан'
		const poster = item.coverImage ? item.coverImage.large : 'default-image.jpg'

		listDrama.innerHTML += `
            <div class="card_title">
                <div class="wrapper">
                    <a href="page.html?id=${id}&title=${encodeURIComponent(
			title
		)}">
                        <div class="poster">
                            <img src="${poster}" alt="${title}">
                        </div>
                        <div class="info">
                            <h2>${title}</h2>
                            <p>${year}</p>
                        </div>
                    </a>
                </div>
            </div>`
	})

	// Отображаем аниме от студии Bones
	studiosAnime.forEach(item => {
		const id = item.id
		const title = item.title.romaji || item.title.english || 'Без названия'
		const year = item.startDate.year || 'Не указан'
		const poster = item.coverImage ? item.coverImage.large : 'default-image.jpg'

		listStudios.innerHTML += `
            <div class="card_title">
                <div class="wrapper">
                    <a href="page.html?id=${id}&title=${encodeURIComponent(
			title
		)}">
                        <div class="poster">
                            <img src="${poster}" alt="${title}">
                        </div>
                        <div class="info">
                            <h2>${title}</h2>
                            <p>${year}</p>
                        </div>
                    </a>
                </div>
            </div>`
	})

	// Отображаем случайные аниме
	randomAnime.forEach(item => {
		const id = item.id
		const title = item.title.romaji || item.title.english || 'Без названия'
		const year = item.startDate.year || 'Не указан'
		const poster = item.coverImage ? item.coverImage.large : 'default-image.jpg'

		list.innerHTML += `
		
            <div class="card_title">
                <div class="wrapper">
                    <a href="page.html?id=${id}&title=${encodeURIComponent(
			title
		)}">
                        <div class="poster">
                            <img src="${poster}" alt="${title}">
                        </div>
                        <div class="info">
                            <h2>${title}</h2>
                            <p>${year}</p>
                        </div>
                    </a>
                </div>
            </div>`
	})
}

// Функция для выбора случайных элементов из массива
function getRandomItems(arr, num) {
	const shuffled = arr.slice(0) // Копируем массив, чтобы не изменять оригинальный
	let i = arr.length,
		randomIndex,
		tempValue

	// Перемешиваем массив случайным образом (метод Фишера-Йетса)
	while (i--) {
		randomIndex = Math.floor(Math.random() * (i + 1))
		tempValue = shuffled[i]
		shuffled[i] = shuffled[randomIndex]
		shuffled[randomIndex] = tempValue
	}

	return shuffled.slice(0, num) // Возвращаем нужное количество случайных элементов
}
document.addEventListener('DOMContentLoaded', function () {
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    const carousel = document.querySelector('.carousel');
    let currentIndex = 0;

    const items = document.querySelectorAll('.carousel-item');
    const totalItems = items.length;

    // Функция для обновления позиции карусели
    function updateCarouselPosition() {
        const offset = -currentIndex * 100;
        carousel.style.transform = `translateX(${offset}%)`;
    }

    // Переключение на следующий элемент
    nextButton.addEventListener('click', function () {
        currentIndex = (currentIndex + 1) % totalItems;
        updateCarouselPosition();
    });

    // Переключение на предыдущий элемент
    prevButton.addEventListener('click', function () {
        currentIndex = (currentIndex - 1 + totalItems) % totalItems;
        updateCarouselPosition();
    });

    // Инициализация позиции карусели
    updateCarouselPosition();
});
