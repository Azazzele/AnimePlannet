
import './newanime.js'
import './birthday.js'
import './navbar.js'

const list = document.querySelector('#anime-list') // Список всех аниме
const listNew = document.querySelector('#anime-list-new') // Список новинок
const listPopular = document.querySelector('#anime-list-popular') // Список популярных аниме
const listTopRated = document.querySelector('#anime-list-top-rated') // Список лучших по рейтингу аниме

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

    // Выбираем случайные аниме для популярных и топовых
    const randomPopularAnime = getRandomItems(popularAnime, 14)

    // Функция для создания карточки аниме
    function createAnimeCard(item) {
        const id = item.id
        const title = item.title.romaji || item.title.english || 'Без названия'
        const year = item.startDate.year || 'Не указан'
        const poster = item.coverImage ? item.coverImage.large : 'default-image.jpg'
        const format = item.format || 'Не указан' // Получаем тип сериала

        return `
            <div class="card_title">
                <div class="wrapper">
                    <a href="page.html?id=${id}&title=${encodeURIComponent(title)}">
                        <div class="poster">
                            <img src="${poster}" alt="${title}">
                        </div>
                        <div class="info">
                            <h2>${title}</h2>
                            <p>${year}</p>
                            <p>${format}</p>  <!-- Отображаем тип сериала -->
                        </div>
                    </a>
                </div>
            </div>`
    }

    // Отображаем новинки (аниме, выпущенные в текущем году)
    newAnime.forEach(item => {
        listNew.innerHTML += createAnimeCard(item)
    })


    // Отображаем случайные аниме
    randomPopularAnime.forEach(item => {
        list.innerHTML += createAnimeCard(item)
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
