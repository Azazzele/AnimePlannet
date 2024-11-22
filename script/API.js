import './newanime.js'
import './birthday.js'

const list = document.querySelector('#anime-list')
const list_new = document.querySelector('#anime-list-new')

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
        }
    }
}
`

const variables = {
	page: 125, // Первая страница
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

console.log('Options:', options)

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
	console.log('Received Data:', data) // Логируем полученные данные для отладки

	const media = data.data.Page.media
	const currentYear = new Date().getFullYear()

	// Фильтруем аниме, выпущенные в текущем году
	const newAnime = media.filter(
		item => item.startDate && item.startDate.year === currentYear
	)
	console.log('New Anime:', newAnime) 

	const randomAnime = getRandomItems(media, 7)
	console.log('Random Anime:', randomAnime) 

	// Отображаем случайные аниме
	randomAnime.forEach(item => {
		const id = item.id
		const title = item.title.romaji || item.title.english || 'Без названия'
		const year = item.startDate.year || 'Не указан'
		const poster = item.coverImage ? item.coverImage.large : 'default-image.jpg' // Используем изображение по умолчанию

		list.innerHTML += `
            <div class="card_title">
                <a href="page.html?id=${id}&title=${encodeURIComponent(title)}">
                    <div class="poster">
                        <img src="${poster}" alt="${title}">
                    </div>
                    <div class="info">
                        <h2>${title}</h2>
                        <p>${year}</p>
                    </div>
                </a>
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

// Функция для обработки ошибок
function handleError(error) {
	console.error('Ошибка при получении данных:', error) // Логируем ошибку
}
