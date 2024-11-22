const query = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: [SCORE_DESC]) {  # Фильтрация по типу 'ANIME' и сортировка по рейтингу
        id
        title {
          romaji
          english
        }
        coverImage {
          extraLarge
        }
        startDate {
          year
        }
        
        averageScore  # Средний балл (рейтинг)
      }
    }
  }
`

const variables = {
	page: 1, // Первая страница
	perPage: 35, // Количество аниме на одну страницу
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

const list = document.querySelector('#list_anime_main') // Контейнер для аниме

// Отправка запроса и обработка ответа
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

	// Очистка контейнера перед добавлением новых данных
	list.innerHTML = ''

	// Отображаем аниме
	media.forEach(item => {
		const id = item.id
		const title = item.title.romaji || 'Без названия'
		const year = item.startDate.year || 'Не указан'
		const poster = item.coverImage
			? item.coverImage.extraLarge
			: 'default-image.jpg' // Используем изображение по умолчанию
		const score = item.averageScore
			? (item.averageScore / 10).toFixed(1)
			: 'Нет рейтинга' // Рейтинг с десятичной точкой

		// Строим HTML строку с помощью innerHTML
		list.innerHTML += `
      <div class="card_title">
        <a href="../page.html?id=${id}&title=${encodeURIComponent(title)}">
          <div class="poster">
            <img src="${poster}" alt="${title}">
          </div>
          <div class="info">
            <div class="score">Рейтинг: ${score}</div>  <!-- Рейтинг с десятичной точкой -->
          </div>
        </a>
      </div>
    `
	})
}

// Функция для обработки ошибок
function handleError(error) {
	console.error('Ошибка при получении данных:', error) // Логируем ошибку
	list.innerHTML = '<p>Ошибка при загрузке данных. Попробуйте позже.</p>'
}
