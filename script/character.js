const urlParams = new URLSearchParams(window.location.search)
const characterId = urlParams.get('id')
const title = decodeURIComponent(urlParams.get('title'))

// Логируем ID и title для отладки
console.log('Character ID:', characterId)
console.log('Title:', title)

// Проверка на корректность ID
if (!characterId || isNaN(characterId)) {
	console.error('Ошибка: ID персонажа не указан или указан некорректно.')
	document.querySelector('#character-details').innerHTML =
		'<p>Ошибка: ID персонажа не указан или указан некорректно.</p>'
} else {
	const characterDetailsContainer = document.querySelector('#character-details')

	// GraphQL запрос для получения данных о персонаже
	const queryCharacter = `
    query ($characterId: Int) {
      Character(id: $characterId) {
        id
        name {
          full
        }
        image {
          large
        }
        description
        dateOfBirth {
          year
          month
          day
        }
        gender
        age
        animeRoles {
          edges {
            node {
              media {
                title {
                  romaji
                }
              }
            }
          }
        }
      }
    }`

	const variables = {
		characterId: parseInt(characterId, 10), // Преобразуем в число с основанием 10
	}

	const url = 'https://graphql.anilist.co'
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: JSON.stringify({
			query: queryCharacter,
			variables: variables,
		}),
	}

	// Отправка запроса
	fetch(url, options)
		.then(handleResponse)
		.then(data => handleCharacterData(data, characterDetailsContainer))
		.catch(handleError)
}

// Функция для обработки ответа от API
function handleResponse(response) {
	if (!response.ok) {
		console.error('Ошибка сети:', response.status, response.statusText) // Логируем статус ошибки
		return Promise.reject(
			`Сетевая ошибка: ${response.status} - ${response.statusText}`
		) // Отправляем ошибку с деталями
	}
	return response.json() // Возвращаем ответ как JSON
}

// Функция для обработки данных персонажа
function handleCharacterData(data, characterDetailsContainer) {
	console.log('Received Data:', data) // Логируем полученные данные

	// Проверка на ошибки в ответе
	if (data.errors) {
		console.error('Ошибки в ответе:', data.errors)
		characterDetailsContainer.innerHTML =
			'<p>Ошибка при получении данных. Попробуйте позже.</p>'
		return
	}

	const character = data.data.Character

	// Подготовка данных для отображения
	const imageUrl =
		character.image && character.image.large
			? character.image.large
			: 'https://via.placeholder.com/150?text=No+Image' // Заглушка для изображения

	const birthDate = character.dateOfBirth
		? `${character.dateOfBirth.day || 'Не указан'}/${
				character.dateOfBirth.month || 'Не указан'
		  }/${character.dateOfBirth.year || 'Не указан'}`
		: 'Не указано'

	const rating = character.age || 'Не указан'

	const animeRoles =
		character.animeRoles.edges
			.map(edge => `<li>${edge.node.media.title.romaji}</li>`)
			.join('') || '<li>Роли не найдены</li>'

	// Заполнение контейнера с данными персонажа
	characterDetailsContainer.innerHTML = `
        <div class="character-image">
            <img src="${imageUrl}" alt="${character.name.full}">
        </div>
        <div class="character-info">
            <h2>${character.name.full}</h2>
            <p><strong>Описание:</strong> ${
							character.description || 'Описание не доступно'
						}</p>
            <p><strong>Дата рождения:</strong> ${birthDate}</p>
            <p><strong>Пол:</strong> ${character.gender || 'Не указан'}</p>
            <p><strong>Возраст:</strong> ${rating}</p>
            <h3>Роли в аниме:</h3>
            <ul>
                ${animeRoles}
            </ul>
        </div>
    `
}

// Функция для обработки ошибок при запросе данных
function handleError(error) {
	console.error('Ошибка при получении данных:', error) // Логируем детальную ошибку
	document.querySelector(
		'#character-details'
	).innerHTML = `<p>Ошибка при загрузке данных. Подробности: ${error}</p>` // Отображаем детальную ошибку на странице
}