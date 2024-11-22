// В файле newanime.js
const anime_list_new = document.querySelector('#anime-list-new')

// Запрос на получение аниме
const newAnimeQuery = `
query($season: MediaSeason, $seasonYear: Int) {
    Page {
        media(season: $season, seasonYear: $seasonYear) {
            id
            title {
                romaji
                english
            }
            coverImage {
                large
            }
        }
    }
}
`

const variables = {
	season: 'FALL', // Используем сезон "осень" (Fall)
	seasonYear: 2024, // Год 2024
}

const url = 'https://graphql.anilist.co'
const options = {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
	body: JSON.stringify({
		query: newAnimeQuery,
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
	return response.json()
}

// Функция для обработки данных
function handleData(data) {
	console.log('Received Data:', data)

	const media = data.data.Page.media
    const randomAnime = getRandomItems(media, 14)

	// Проходим по новинкам и выводим их данные
	randomAnime.forEach(item => {
		const id = item.id
		const title = item.title.romaji || item.title.english || 'Без названия'
		const poster = item.coverImage ? item.coverImage.large : 'default-image.jpg'

		anime_list_new.innerHTML += `
            <div class="card_title">
                <a href="page.html?id=${id}&title=${encodeURIComponent(title)}">
                    <div class="poster">
                        <img src="${poster}" alt="${title}">
                    </div>
                    <div class="info">
                        <h2>${title}</h2>
                    </div>
                </a>
            </div>`
	})
}
function getRandomItems(arr, num) {
	const shuffled = arr.slice(0)
	let i = arr.length,
		randomIndex,
		tempValue
	while (i--) {
		randomIndex = Math.floor(Math.random() * (i + 1))
		tempValue = shuffled[i]
		shuffled[i] = shuffled[randomIndex]
		shuffled[randomIndex] = tempValue
	}
	return shuffled.slice(0, num)
}
// Функция для обработки ошибок
function handleError(error) {
	console.error('Ошибка при получении данных:', error)
}
