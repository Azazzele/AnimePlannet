// Получаем параметры из URL
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');  // ID аниме
const title = decodeURIComponent(urlParams.get('title'));

const detailsContainer = document.querySelector('#anime-details');

// ГрафQL-запрос для получения подробной информации
const query = `
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
    bannerImage
    coverImage {
      extraLarge
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
    staff {
      nodes {
        name {
          full
        }
        image {
          large
        }
        age
        dateOfBirth {
          day
          month
          year
        }
        dateOfDeath {
          day
          month
          year
        }
      }
    }
  }
}
`;

const variables = {
    id: parseInt(id)  // Используем ID, переданный в URL
};

const url = 'https://graphql.anilist.co';
const options = {
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
              <a href="html/character.html?name=${encodeURIComponent(media.title.romaji)}&id=${characterId}" class="character-link">
                  <img src="${imageUrl}" alt="${edge.node.name.full}">
                  <p>${edge.node.name.full}</p>
              </a>
          </div>
      `;
  }).join('') : '<p>Персонажи не найдены</p>';

  // Формируем HTML для сотрудников
  const staff = media.staff.nodes.length > 0 ? media.staff.nodes.map(person => {
      const personImage = person.image ? person.image.large : 'https://via.placeholder.com/150?text=No+Image';
      const personName = person.name ? person.name.full : 'Не указан';
      const personAge = person.age ? `Возраст: ${person.age}` : 'Возраст не указан';
      const personBirth = person.dateOfBirth ? `${person.dateOfBirth.year}.${person.dateOfBirth.month}.${person.dateOfBirth.day}` : 'Дата рождения не указана';
      const personDeath = person.dateOfDeath ? `${person.dateOfDeath.year}.${person.dateOfDeath.month}.${person.dateOfDeath.day}` : 'Дата смерти не указана';
      const personHometown = person.homeTown ? `Город: ${person.homeTown}` : 'Город не указан';

      return `
          <div class="character">
              <img src="${personImage}" alt="${personName}">
              <div>
                  <p><strong>${personName}</strong></p>
                  <p>${personAge}</p>
                  <p>${personBirth}</p>
                  <p>${personDeath}</p>
                 
              </div>
          </div>
      `;
  }).join('') : '<p>Сотрудники не найдены</p>';

  // Обрабатываем изображение баннера и постера
  const bannerImage = media.bannerImage || 'https://preview.redd.it/qm5q37j0ba931.png?width=1080&crop=smart&auto=webp&s=6aaf20d7f0e8e65ab87c8e9b720ea6b0207776ca';
  const coverImage = media.coverImage ? media.coverImage.extraLarge : 'https://via.placeholder.com/500x750?text=No+Image';

  const trailerHTML = media.trailer ? `
    <div class="trailer">
      <h3>Трейлер:</h3>
      <a href="${media.trailer.url}" target="_blank">
        <img src="${media.trailer.thumbnail}" alt="Трейлер ${media.title.romaji}">
      </a>
    </div>
  ` : '';

  detailsContainer.innerHTML = `
    <div class="banner">
        <img src="${bannerImage}" alt="Баннер ${media.title.romaji}">
    </div>
    <div class="poster-card">
        <div class="main_info">
            <div class="poster">
                <img src="${coverImage}" alt="${media.title.romaji}">
            </div>
            <h2>${media.title.romaji || media.title.english}</h2>
            <h2>${media.title.native}</h2>
        </div>
        <div class="info">
            <p><strong>Год выпуска:</strong> ${media.startDate.year || 'Не указан'}</p>
            <p><strong>Год завершения:</strong> ${media.endDate ? media.endDate.year : 'Не завершено'}</p>
            <p><strong>Эпизоды:</strong> ${media.episodes || 'Не указано'}</p>
            <p><strong>Жанры:</strong> ${media.genres.join(', ')}</p>
            <p><strong>Рейтинг:</strong> ${rating}/10</p>
            <p><strong>Популярность:</strong> ${media.popularity || 'Не указано'}</p>
            <p><strong>Сезоны:</strong> ${media.volumes || 'Не указано'}</p>
            <p><strong>Формат:</strong> ${media.format || 'Не указан'}</p>
            <p><strong>Статус:</strong> ${media.status || 'Не указан'}</p>
            <p><strong>Страна происхождения:</strong> ${media.countryOfOrigin || 'Не указана'}</p>
            <p><strong>Студия:</strong> ${media.studios.nodes.map(studio => studio.name).join(', ') || 'Не указана'}</p>
        </div>
    </div>

    <div class="tabs">
        <button class="tab-button active" data-tab="description">Описание</button>
        <button class="tab-button" data-tab="characters">Персонажи</button>
        <button class="tab-button" data-tab="staff">Сотрудники</button>
    </div>

    <div class="tab-content">
        <div class="tab-pane active" id="description">
            <div class="list_info">
                <h3><strong>Описание</strong></h3>
                <p>${media.description || 'Описание не доступно'}</p>
            </div>
        </div>
        <div class="tab-pane" id="characters">
            <div class="characters">
                <a href='#'><h3>Персонажи:</h3></a>
                <div class="character-list">
                    ${characters}
                </div>
            </div>
        </div>
        <div class="tab-pane" id="staff">
            <div class="characters">
                <h3>Сотрудники:</h3>
                <div class="character-list">
                    ${staff}
                </div>
            </div>
        </div>
    </div>
  `;

  detailsContainer.classList.add('loaded');
  setupTabSwitch(); // Включаем функциональность вкладок
}

function handleError(error) {
    console.error('Ошибка при получении данных:', error);
    detailsContainer.innerHTML = '<p>Ошибка при загрузке данных. Попробуйте позже.</p>';
}

function setupTabSwitch() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    function activateTab(tabId) {
        tabButtons.forEach(button => button.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        const activeButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
        const activePane = document.getElementById(tabId);
        activeButton.classList.add('active');
        activePane.classList.add('active');
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            activateTab(tabId);
        });
    });

    activateTab('description');  // Активируем вкладку "Описание" по умолчанию
}
