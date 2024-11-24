const query = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: [SCORE_DESC]) {
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
        averageScore
		format  
      }
      pageInfo {
        total
        perPage
        currentPage
      }
    }
  }
`

let currentPage = 1
const perPage = 35 // Количество аниме на одной странице

const list = document.querySelector('#list_anime_main') // Контейнер для аниме
const paginationContainer = document.querySelector('#pagination-container') // Контейнер для пагинации

const variables = {
	page: currentPage,
	perPage: perPage,
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
	const pageInfo = data.data.Page.pageInfo

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
			? (item.averageScore / 10).toFixed(2)
			: 'Нет рейтинга' // Рейтинг с десятичной точкой

		list.innerHTML += `
      <div class="card_title listaall">
        <a href="../page.html?id=${id}&title=${encodeURIComponent(title)}">
          <div class="poster">
            <img src="${poster}" alt="${title}">
          </div>
          <div class="info">
            <div class="score">${score}</div>
          </div>
        </a>
      </div>
    `
	})

	// Вычисляем количество страниц
	const totalPages = Math.ceil(pageInfo.total / perPage)

	// Обновляем пагинацию
	updatePagination(pageInfo.currentPage, totalPages)
}

// Функция для обновления пагинации
function updatePagination(currentPage, totalPages) {
	paginationContainer.innerHTML = '' // Очищаем контейнер пагинации
	if (currentPage > 3) {
		paginationContainer.innerHTML += `
      <button class="btn" onclick="changePage(1)">Первая</button>
    `
	}
	// Кнопка "Назад"
	if (currentPage > 1) {
		paginationContainer.innerHTML += `<button class="btn" onclick="changePage(${
			currentPage - 1
		})">Назад</button>`
	}

	// Текущая страница
	paginationContainer.innerHTML += `<span>Страница ${currentPage} из ${totalPages}</span>`

	// Кнопка "Вперед"
	if (currentPage < totalPages) {
		paginationContainer.innerHTML += `<button class="btn" onclick="changePage(${
			currentPage + 1
		})">Вперед</button>`
	}
}

// Функция для изменения страницы
function changePage(page) {
	currentPage = page
	fetchData() // Перезапрашиваем данные для новой страницы
	window.scrollTo({ top: 0, behavior: 'smooth' }) // Прокручиваем страницу наверх
}

// Функция для отправки запроса с новыми параметрами
function fetchData() {
	const variables = {
		page: currentPage, // Текущая страница
		perPage: perPage, // Количество аниме на одну страницу
	}

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

	fetch(url, options).then(handleResponse).then(handleData).catch(handleError)
}

// Функция для обработки ошибок
function handleError(error) {
	console.error('Ошибка при получении данных:', error) // Логируем ошибку
	list.innerHTML = '<p>Ошибка при загрузке данных. Попробуйте позже.</p>'
}
