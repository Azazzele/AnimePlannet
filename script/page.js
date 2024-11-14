// Получаем параметры из URL
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');  // ID аниме
const title = decodeURIComponent(urlParams.get('title'));  // Название аниме

// Элемент для отображения данных
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
    characters {
      edges {
        node {
          name {
            full
          }
          image {
            large
          }
        }
      }
    }
  }
}
`;

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

    // Создаем строку с персонажами
    const characters = media.characters.edges.length > 0 ? media.characters.edges.map(edge => {
        const imageUrl = edge.node.image ? edge.node.image.large : 'https://via.placeholder.com/150?text=No+Image';
        return `
            <div class="character">
                <img src="${imageUrl}" alt="${edge.node.name.full}">
                <p>${edge.node.name.full}</p>
            </div>
        `;
    }).join('') : '<p>Персонажи не найдены</p>';

    // Строим HTML-контент для подробностей аниме
    detailsContainer.innerHTML = `
        <div class="poster-card">
            <div class="main_info">
                <div class="poster">
                    <img src="${media.coverImage.large}" alt="${media.title.romaji}">
                </div>
                <div class="list_info">
                <h2>${media.title.romaji || media.title.english || media.title.native}</h2>
                    <p><strong>Описание</strong></p>
                    <p>${media.description || 'Описание не доступно'}</p>
                </div>
            </div>
        </div>
        <div class="info">
            <p><strong>Год выпуска:</strong> ${media.startDate.year || 'Не указан'}</p>
            <p><strong>Год завершения:</strong> ${media.endDate ? media.endDate.year : 'Не завершено'}</p>
            <p><strong>Эпизоды:</strong> ${media.episodes || 'Не указано'}</p>
            <p><strong>Жанры:</strong> ${media.genres.join(', ')}</p>
        </div>
        <div class="characters">
            <h3>Персонажи:</h3>
            <div class="character-list">
                ${characters}
            </div>
        </div>
    `;
    detailsContainer.classList.add('loaded');
}

function handleError(error) {
    console.error('Ошибка при получении данных:', error);  // Логируем ошибку
    detailsContainer.innerHTML = '<p>Ошибка при загрузке данных. Попробуйте позже.</p>';
}
