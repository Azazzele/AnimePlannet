// Получаем параметры из URL
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');  // ID аниме
const title = decodeURIComponent(urlParams.get('title'));

const detailsContainer = document.querySelector('#anime-details');

// ГрафQL-запрос для получения подробной информации
var query = `
query ($id: Int) {
  Media (id: $id) {
    title {
      romaji
      english
      native
    }
    startDate {
      year
    }
    endDate {
      year
    }
    coverImage {
      large
    }
    description
    genres
    episodes
    volumes
    format
    characters {
      edges {
        node {
        id
          name {
            full
          }
          image {
            large
          }
        }
      }
    }
    averageScore
    popularity
    status
    countryOfOrigin
    studios {
      nodes {
        name
      }
    }
    bannerImage
  }
}
`

var variables = {
    id: parseInt(id)  // Используем ID, переданный в URL
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

// Отправляем запрос и обрабатываем ответ
fetch(url, options)
    .then(handleResponse)  // Обрабатываем ответ
    .then(handleData)      // Обрабатываем данные
    .catch(handleError);   // Обрабатываем ошибки

function handleResponse(response) {
    if (!response.ok) {
        throw new Error('Сетевая ошибка');
    }
    return response.json();  // Парсим ответ как JSON
}

function handleData(data) {
  const media = data.data.Media;

  // Нормируем рейтинг в диапазон от 1 до 10
  const rating = media.averageScore ? (media.averageScore / 10).toFixed(1) : 'Не указан';

  // Создаем строку с персонажами
  const characters = media.characters.edges.length > 0 ? media.characters.edges.map(edge => {
      const imageUrl = edge.node.image ? edge.node.image.large : 'https://via.placeholder.com/150?text=No+Image';
      const characterId = edge.node.id;

      return `
          <div class="character">
              <a href="html/character.html?title=${encodeURIComponent(
								media.title.romaji)}&id=${characterId}" class="character-link">
                  <img src="${imageUrl}" alt="${edge.node.name.full}">
                  <p>${edge.node.name.full}</p>
              </a>
          </div>
      `
  }).join('') : '<p>Персонажи не найдены</p>';
  
  // Строим HTML-контент для подробностей аниме
  detailsContainer.innerHTML = `
      <div class="poster-card">
          <div class="main_info">
              <div class="poster">
                  <img src="${media.coverImage.large}" alt="${
		media.title.romaji
	}">
              </div>
              <div class="list_info">
                  <h2>${media.title.romaji || media.title.english}</h2>
                  <h2>${media.title.native}</h2>
                  <h3><strong>Описание</strong></h3>
                  <p>${media.description || 'Описание не доступно'}</p>
                  <p><strong>Студия:</strong> ${
										media.studios.nodes.map(studio => studio.name).join(', ') ||
										'Не указана'
									}</p>
              </div>
          </div>
      </div>
      <h3>Информация</h3>
      <div class="info">
          <p><strong>Год выпуска:</strong> ${
						media.startDate.year || 'Не указан'
					}</p>
          <p><strong>Год завершения:</strong> ${
						media.endDate ? media.endDate.year : 'Не завершено'
					}</p>
          <p><strong>Эпизоды:</strong> ${media.episodes || 'Не указано'}</p>
          <p><strong>Жанры:</strong> ${media.genres.join(', ')}</p>
          <p><strong>Рейтинг:</strong> ${rating}/10</p> <!-- Отображаем рейтинг от 1 до 10 -->
          <p><strong>Популярность:</strong> ${
						media.popularity || 'Не указано'
					}</p>
          <p><strong>Сезоно:</strong> ${media.volumes || 'Не указан'}</p>
          <p><strong>Формат:</strong> ${media.format || 'Не указан'}</p>
          <p><strong>Статус:</strong> ${media.status || 'Не указан'}</p>
          <p><strong>Страна происхождения:</strong> ${
						media.countryOfOrigin || 'Не указана'
					}</p>
          
      </div>
      <div class="characters">
          <a href ='#'><h3>Персонажи:</h3></a>
          <div class="character-list">
              ${characters}
          </div>
      </div>
  `
  detailsContainer.classList.add('loaded');
}

function handleError(error) {
    console.error('Ошибка при получении данных:', error);  // Логируем ошибку
    detailsContainer.innerHTML = '<p>Ошибка при загрузке данных. Попробуйте позже.</p>';
}
