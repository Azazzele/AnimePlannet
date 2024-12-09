import {getFormatText,getGenres} from '../Ru/units.js';
import './navbar.js'

// Запрос GraphQL
const query = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: MANGA, sort: [SCORE_DESC]) {
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
        description
        genres
        chapters

        duration
        volumes
      }
      pageInfo {
        total
        perPage
        currentPage
      }
    }
  }
`;

// Переменные для пагинации
let currentPage = 1;
const perPage = 35; // Количество манги на одной странице

const list = document.querySelector('#list_manga_main'); 
const paginationContainer = document.querySelector('#pagination-container'); 

const variables = {
  page: currentPage,
  perPage: perPage,
};

const url = 'https://graphql.anilist.co';

function fetchData() {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query: query,
      variables: { page: currentPage, perPage: perPage },  // Используем currentPage для динамического запроса
    }),
  };

  fetch(url, options)
    .then(handleResponse)
    .then(handleData)
    .catch(handleError);
}

// Отправка запроса
fetchData();

// Функция для обработки ответа
function handleResponse(response) {
  if (!response.ok) {
    throw new Error('Сетевая ошибка');
  }
  return response.json(); // Парсим ответ как JSON
}

// Функция для обработки данных
function handleData(data) {
  const media = data.data.Page.media;
  const pageInfo = data.data.Page.pageInfo;

  // Очистка контейнера перед добавлением новых данных
  list.innerHTML = '';

  // Отображаем мангу
  media.forEach(item => {
    const id = item.id;
    const title = item.title.romaji || item.title.english || 'Без названия';
    const year = item.startDate.year || 'Не указан';
    const poster = item.coverImage
      ? item.coverImage.extraLarge
      : 'default-image.jpg'; // Используем изображение по умолчанию
    const score = item.averageScore
      ? (item.averageScore / 10).toFixed(2)
      : 'Нет рейтинга'; // Рейтинг с десятичной точкой
    const format = item.format || 'Не указан';
    const description = item.description ? item.description.replace(/<[^>]+>/g, '') : 'Описание не доступно';
    const genres = item.genres ? item.genres : 'Не указаны';
    const chapters = item.chapters ? item.chapters : '?';
    const volume = item.volumes ? item.volumes : '?';
    list.innerHTML += `
    <a href="../page.html?title=${encodeURIComponent(title)}&id=${id}" class="manga-card-link">
      <div class="card_title listaall">
        <div class="poster">
          <img src="${poster}" alt="${title}">
        </div>
        <div class="info">
          <div class="score">${score}</div>
          <div class="format">${getFormatText(format)}</div>
          <div class="year">${year}</div>
        </div>
        <div class="hover-info">
          <h3>${title}</h3>
          <p>${description.length > 200 ? description.substring(0, 200) + '...' : description}</p>
          <span class="genres">Жанры: ${getGenres(genres)}</span>
          <span class="release-date">Дата выхода: ${year}</span>
          <span class="chapters">Томов: ${volume}</span>
          <span class="chapters">Глав: ${chapters}</span>
        </div>
      </div>
    </a>
    `;
  });

  // Вычисляем количество страниц
  const totalPages = Math.ceil(pageInfo.total / perPage);

  // Обновляем пагинацию
  updatePagination(pageInfo.currentPage, totalPages);
}

/// Функция для обновления пагинации
function updatePagination(currentPage, totalPages) {
  paginationContainer.innerHTML = ''; // Очищаем контейнер пагинации

  // Кнопка "Первая"
  if (currentPage > 3) {
    paginationContainer.innerHTML += `
      <button class="btn" data-page="1">Первая</button>
    `;
  }

  // Кнопка "Назад"
  if (currentPage > 1) {
     paginationContainer.innerHTML += `<button class="btn" data-page="${currentPage - 1}">Назад</button>`;
  }

 paginationContainer.innerHTML += `<span>Страница ${currentPage} из ${totalPages}</span>`;

 if (currentPage < totalPages) {
    paginationContainer.innerHTML += `<button class="btn" data-page="${currentPage + 1}">Вперед</button>`;
  }
   // Добавление обработчиков событий для кнопок пагинации
  const paginationButtons = paginationContainer.querySelectorAll('.btn');
  paginationButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const page = parseInt(event.target.getAttribute('data-page'));
      changePage(page);
    });
  });
}


// Функция для изменения страницы
function changePage(page) {
  currentPage = page;
  fetchData(); // Перезапрашиваем данные для новой страницы
  window.scrollTo({ top: 0, behavior: 'smooth' }); // Прокручиваем страницу наверх
}

// Функция для обработки ошибок
function handleError(error) {
  console.error('Ошибка при получении данных:', error); // Логируем ошибку
  list.innerHTML = '<p>Ошибка при загрузке данных. Попробуйте позже.</p>';
}
