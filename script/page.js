import { getStatusText, getFormatText, getGenres,checkBirthday } from '../Ru/units.js'; 


// Получаем параметры из URL
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');  // ID аниме
const title = decodeURIComponent(urlParams.get('title'));

const detailsContainer = document.querySelector('#anime-details');

// ГрафQL-запрос для получения подробной информации
const query = `
  query ($id: Int, $page: Int, $perPage: Int,   $sort: [CharacterSort],$recommendationsPage2: Int,   $recommendationsPerPage2: Int) {
  Media (id: $id) {
    recommendations(page: $recommendationsPage2, perPage: $recommendationsPerPage2) {
      edges {
        node {
          id
          mediaRecommendation {
            title {
              romaji
              
            }
            id
            format
            startDate {
              year
            }
            coverImage {
              extraLarge
            }
          }
        }
      }
    }
    type
    format
    title {
      romaji
      english
      native
    }
    startDate {
      year
      month
      day
    }
    endDate {
      year
      month
      day
    }
    bannerImage
    coverImage {
      extraLarge
    }
    description
    genres
    episodes
    meanScore
    seasonYear
    season
    format
    duration
    characters(page: $page, perPage: $perPage,  sort: $sort) {
      edges {
        node {
          id
          name {
            full
          }
          image {
            large
          }
          dateOfBirth {
            year
            month
            day
          }
        }
      }
    }
    trailer {
      id
      site
      thumbnail
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
        id
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
    nextAiringEpisode {
      id
      airingAt
      timeUntilAiring
      episode
      mediaId
    }
    relations {
      edges {
        node {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            extraLarge
          }
          format
          startDate {
            year
            month
            day
          }
        }
      }
    }
  }
}`;

const variables = {
  id: parseInt(id),  
  page: 1,
  perPage: 25,
  sort: ["ID"],
  recommendationsPage2: 1,
  recommendationsPerPage2: 25,
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
    variables: variables,

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

function handleError(error) {
  console.error('Ошибка:', error);
  detailsContainer.innerHTML = '<p>Произошла ошибка при загрузке данных. Попробуйте позже.</p>';
}

function handleData(data) {
  const media = data.data.Media;
  const typeTitle = media.type
  const formatTitle = media.format

  let nextEpisodeInfo = '';

  if (media.status === 'RELEASING' && media.nextAiringEpisode) {
    const nextEpisode = media.nextAiringEpisode;
    const nextEpisodeTime = new Date(nextEpisode.airingAt * 1000); 
    const timeUntilAiring = nextEpisode.timeUntilAiring;
    nextEpisodeInfo = `
      <div class="next-episode">
        <h3>Следующий эпизод:</h3>
        <p>Эпизод <span>${nextEpisode.episode}</span></p>
        <p>Дата выхода: ${nextEpisodeTime.toLocaleString('ru-RU')}</p>
        <p class="time">До выхода: ${formatTimeUntilAiring(timeUntilAiring)}</p>
      </div>`;
  }

  // Обрабатываем изображение баннера и постера
  const bannerImage = media.bannerImage || 'https://preview.redd.it/qm5q37j0ba931.png?width=1080&crop=smart&auto=webp&s=6aaf20d7f0e8e65ab87c8e9b720ea6b0207776ca';
  const coverImage = media.coverImage ? media.coverImage.extraLarge : 'https://via.placeholder.com/500x750?text=No+Image';
 
  const genres = (media.genres.length > 0 ? media.genres : 'Жанры не указаны');

    // Персонажи
  const characters = media.characters.edges.length > 0 ? media.characters.edges.map(character => {
    const characterData = character.node;
    const characterId = characterData.id;
    const characterName = characterData.name.full;
    const birthDate = characterData.dateOfBirth; // Получаем дату рождения персонажа
    const birthdayCelebration = checkBirthday(birthDate); // Функция, которая вернет HTML для торта
    return `
      <a href="html/character.html?name=${encodeURIComponent(media.title.romaji)}&id=${characterId}" class="character-link">
        <div class="character-card">
          <img src="${characterData.image.large}" alt="${characterData.name.full}">
          <p>${characterName}${birthdayCelebration}</p>
        </div>
      </a>
    `;
  }).join(' ') : 'Персонажи не указаны';

const mediacountryOfOrigin = media.countryOfOrigin
// Сотрудники
const staffSet = new Set();  // Множество для уникальных сотрудников
const staff = media.staff.nodes.length > 0 ? media.staff.nodes.map(person => {
  // Создаем уникальный ключ для каждого сотрудника, используя его имя и, возможно, дату рождения
  const personKey = person.name.full + (person.dateOfBirth ? person.dateOfBirth.year : '');
  
  if (!staffSet.has(personKey)) {  // Проверяем, если сотрудник уже добавлен
    staffSet.add(personKey);  // Добавляем сотрудника в множество

    // Создаем ссылку на страницу сотрудника (предполагается, что у каждого сотрудника есть уникальный ID)
    const personId = person.id;  // ID сотрудника (проверьте, если он существует в GraphQL)
    const personLink = `html/character.html?id=${personId}`;  // Ссылка на страницу сотрудника

    return `
      <a href="${personLink}" class="staff-link">
        <div class="staff-card">
          <img src="${person.image.large}" alt="${person.name.full}">
          <p>${person.name.full}</p>
        </div>
      </a>
    `;
  }

  return '';  // Если сотрудник уже добавлен, пропускаем его
}).join(' ') : 'Сотрудники не указаны';


let trailerSection = '';

// Проверяем, если это манга или ранобэ
if (media.format !== 'MANGA' && media.format !== 'NOVEL') {
  // Если это не манга и не ранобэ, показываем трейлер
  if (media.trailer && media.trailer.id && media.trailer.site) {
    const trailerId = media.trailer.id;
    const trailerSite = media.trailer.site; 
    const trailerThumbnail = media.trailer.thumbnail || 'https://via.placeholder.com/500x300?text=No+Thumbnail';  // Fallback для отсутствующей миниатюры
    
    let videoSource = '';  // Источник видео
    let videoElement = ''; // Элемент для вывода видео

    // Проверяем, какой сайт указан и формируем правильный источник для видео
    if (trailerSite === 'youtube') {
      // Для YouTube формируем ссылку на embed-версию видео
      videoSource = `https://www.youtube.com/embed/${trailerId}?autoplay=1`;
      videoElement = `
        <iframe width="100%" height="500" src="${videoSource}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      `;
    } else if (trailerSite === 'vimeo') {
      // Для Vimeo формируем ссылку на embed-версию видео
      videoSource = `https://player.vimeo.com/video/${trailerId}?autoplay=1`;
      videoElement = `
        <iframe src="${videoSource}" width="100%" height="500" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
      `;
    } else if (trailerSite === 'funimation') {
      // Для Funimation можно использовать прямую ссылку на видео
      videoSource = `https://www.funimation.com/videos/${trailerId}`;
      videoElement = `
        <video width="100%" height="500" controls>
          <source src="${videoSource}" type="video/mp4">
          Ваш браузер не поддерживает видео.
        </video>
      `;
    } else {
      // Если сайт не поддерживает встраивание, и у нас есть URL видеофайла, то используем тег video
      videoSource = `${trailerThumbnail}`;  // Используем ссылку на миниатюру как fallback
      videoElement = `
        <video width="100%" height="500" controls>
          <source src="${videoSource}" type="video/mp4">
          Ваш браузер не поддерживает видео.
        </video>
      `;
    }
    
    trailerSection = `
      <div class="trailer-section">
        <h3>Трейлер</h3>
        ${videoElement}
      </div>
    `;
  } else {
    trailerSection = '<p>Трейлер не доступен.</p>';  // Если данных о трейлере нет
  }
} else {
  trailerSection = '';  // Если это манга или ранобэ, трейлер не показываем
}



 // Обрабатываем рекомендации
  const recommendations = media.recommendations.edges.length > 0 
    ? media.recommendations.edges.map(recommendation => {
        const recommendationData = recommendation.node.mediaRecommendation;  // Используем mediaRecommendation
        
        // Проверяем, что есть данные
        if (!recommendationData) {
          return ''; // Если данных нет, пропускаем
        }

        // Получаем информацию о рекомендации
        const recommendationId = recommendationData.id;
        const recommendationTitle = recommendationData.title.english || recommendationData.title.romaji || recommendationData.title.native || 'Без названия';
        const recommendationImage = recommendationData.coverImage ? recommendationData.coverImage.extraLarge : 'https://via.placeholder.com/200x300?text=No+Image';
        const formatTitle = getFormatText(recommendationData.format)
        const startDate = recommendationData.startDate.year
        // Создаем HTML-контент для каждой рекомендации
        return `
          <a href="page.html?name=${encodeURIComponent(recommendationTitle)}&id=${recommendationId}" class="character-link">
            <div class="character-card">
              <img src="${recommendationImage}" alt="${recommendationTitle}">
              <div class="title_name">
                <div class="details">          
                  <h3>${recommendationTitle}</h3>
                </div>
                 <div class="details">          
                  <p>${getContentType(getFormatText(recommendationData.format) || 'Не указана страна',mediacountryOfOrigin)}</p>
                   <p>${startDate}</p>
                </div>
              </div>
            </div>
          </a>
        `;
      }).join(' ') 
    : 'Рекомендации не указаны';


  // Отношения (Relations)
  const relations = media.relations.edges.length > 0 ? media.relations.edges.map(relation => {
    const relationData = relation.node;
    const relationId = relationData.id;
    const relationTitle = relationData.title.romaji || relationData.title.english || relationData.title.native;
    const relationImage = relationData.coverImage ? relationData.coverImage.extraLarge : 'https://via.placeholder.com/200x300?text=No+Image';
    const formatTitle = getFormatText(relationData.format)
    const startDateTitle = relationData.startDate.year
    return `
      <a href="page.html?name=${encodeURIComponent(relationTitle)}&id=${relationId}" class="character-link">
        <div class="character-card">
          <img src="${relationImage}" alt="${relationTitle}">
          <div class="title_name">
            <div class="details">
              <h3>${relationTitle}</h3>
            </div>
            <div class="details">
              <p>${formatTitle}</p>
              <p>${startDateTitle}</p>   
            </div>
          </div>
        </div>
      </a>
    `;
  }).join(' ') : 'Связанные аниме не указаны';

 // Основной HTML-контент
detailsContainer.innerHTML = `
  <div class="banner">
    <img src="${bannerImage}" alt="Баннер ${media.title.romaji}">
  </div>
  <div class="anime-title">
    <h2>${media.title.romaji || media.title.english}</h2>
    <h2>${media.title.native}</h2>
    <h2>${media.title.english}</h2>
  </div>
  <div class="poster-card">
    <div class="main_info">
      <div class="poster">
        <img src="${coverImage}" alt="${media.title.romaji}">
        <div class="actions">
        <!-- Выпадающее меню для статусов -->
        <div class="status-dropdown">
          <button id="statusBtn" class="status-btn">Добавить в </button>
          <div id="statusMenu" class="status-menu">
            <a href="#" id="planToWatch">Запланировано</a>
            <a href="#" id="watching">Смотрю</a>
            <a href="#" id="watched">Просмотрено</a>  
            <a href="#" id="dropped">Брошено</a> 
          </div>
        </div>
      </div>
    
    </div>
    <div class="info">
      <p><strong><i class="fas fa-calendar-alt"></i> Период:</strong> ${formatDate(media.startDate, media.endDate)}</p>
      <p><strong>Длительность серии:</strong> ${media.duration ? `${media.duration}(минут)` : 'Не указана'}</p>

      <p><strong>Эпизоды:</strong> ${media.episodes || 'Не указано'}</p>
      <p class="studio"><strong>Студия:</strong><span>${media.studios.nodes.slice(0, 3).map(studio => studio.name).join(', ') || 'Не указана'}</span></p>
      <p><strong>Жанры:</strong>
        <div class="genre-container">
          <span class="genre">${getGenres(genres)}</span>
        </div>
      </p>
      <p><i class="fas fa-star-half-alt"> <strong>Рейтинг:</strong> ${media.meanScore ? (media.meanScore / 10).toFixed(2) : 'Не указан'} / 10 </i></p>
      <p><strong>Популярность:</strong> ${media.popularity || 'Не указано'}</p>
      <p><strong>Формат:</strong> ${getContentType(getFormatText(media.format)|| 'Не указана страна', mediacountryOfOrigin)}</p>
      <p><strong>Статус:</strong> ${getStatusText(media.status) }</p>
      <p><strong>Страна происхождения:</strong> ${getRegion(media.countryOfOrigin)}</p>
      ${media.season ? `<p><strong>Сезон:</strong><a href='' class="sesone_link">${media.season} ${media.seasonYear}</p></a>` : ''}
      ${nextEpisodeInfo}
    </div>
  </div>
  
  <!-- Вкладки -->
  <div class="tabs">
    <button class="tab-button active" data-tab="description"><i class="fas fa-info-circle"></i> Описание</button>
    <button class="tab-button" data-tab="farnshise"><i class="fa-solid fa-table-cells-large"></i> Франшиза</button>
    <button class="tab-button" data-tab="characters"><i class="fas fa-users"></i> Персонажи</button>
    <button class="tab-button" data-tab="staff"><i class="fas fa-chalkboard-teacher"></i> Сотрудники</button>
    <button class="tab-button" data-tab="collection"><i class="fa-solid fa-heart"></i> Коллекции</button>
    <button class="tab-button" data-tab="reviews"><i class="fas fa-comments"></i> Отзывы</button>
    <button class="tab-button" data-tab="comments"><i class="fa-regular fa-comments"></i> Комментарии</button>
    <button class="tab-button" data-tab="recomend"><i class="fa-solid fa-sitemap"></i> Похожее</button>
  </div>
  
  <div class="tab-content">
    <div class="tab-pane active" id="description">
      <div class="list_info">
        <h3><strong>Описание</strong></h3>
        <p>${media.description || 'Описание не доступно'}</p>
        <div class="trailer">${trailerSection}</div>
      </div>
    </div>
    <div class="tab-pane" id="farnshise">
      <div class="list_info">
        <h3>Связаное</h3>
        <div class="character-list">
          ${relations || 'Связанноо нет '}
        </div>
      </div>
    </div>
    <div class="tab-pane" id="characters">
      <div class="characters">
        <h3>Персонажи:</h3>
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
    <div class="tab-pane" id="collection">
      <div class="collection">
        <h3>Коллекции:</h3>
        <p>Коллекция для этого аниме еще не добавлена.</p>
      </div>
    </div>
    <div class="tab-pane" id="reviews">
      <div class="reviews">
        <h3>Отзывы:</h3>
        <div class="review-list">
          <p>Отзывы не доступны.</p>
        </div>
      </div>
    </div>
    <div class="tab-pane" id="comments">
      <div class="comment-section">
        <div class="review-list">
          <p>Не доступны.</p>
        </div>
        <h4>Оставить комментарий:</h4>
        <textarea id="commentInput" placeholder="Напишите ваш комментарий здесь..." rows="4"></textarea>
        <button id="submitComment" class="btn-submit">Отправить</button>
      </div>
    </div>
    <div class="tab-pane" id="recomend">
      <div class="characters">
        <h3>Рекомендации:</h3>
        <div class="character-list">
          ${recommendations}
        </div>
      </div>
    </div>
  </div>
   
`;

detailsContainer.classList.add('loaded');
setupTabSwitch(); 


if (media.nextAiringEpisode && media.status === 'RELEASING') {
  setInterval(() => {
    updateTimeUntilAiring(media.nextAiringEpisode);
  }, 1000); 
}

}
function formatTimeUntilAiring(timeInSeconds) {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60); // округление секунд
  return `${hours}ч ${minutes}м ${seconds}с`;
}


function updateTimeUntilAiring(nextEpisode) {
  const currentTime = Date.now() / 1000; // Текущее время в секундах
  const timeUntilAiring = nextEpisode.airingAt - currentTime; // Разница между временем выпуска и текущим временем
  document.querySelector('.time').textContent = `До выхода: ${formatTimeUntilAiring(timeUntilAiring)}`;
}


// Функция для переключения вкладок
function setupTabSwitch() {
  const tabs = document.querySelectorAll('.tab-button');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      
      tabs.forEach(t => t.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));

      tab.classList.add('active');
      document.querySelector(`#${targetTab}`).classList.add('active');
    });
  });
}
function formatDate(startDate, endDate) {
  if (!startDate || !startDate.year) {
    return 'Не указан'; // If start date is missing
  }

  if (!endDate || !endDate.year) {
    return `${formatSingleDate(startDate)} - (настоящее время)`; 
  }

  if (startDate.year === endDate.year && startDate.month === endDate.month && startDate.day === endDate.day) {
    return formatSingleDate(startDate); // If start and end date are the same, show only one
  }

  return `${formatSingleDate(startDate)} - ${formatSingleDate(endDate)}`;
}

function formatSingleDate(date) {
  const year = date.year;
  const month = date.month ? getMonthName(date.month) : '';  // Получаем название месяца, если оно указано
  const day = date.day ? date.day : '';  // Если день не указан, показываем пусто

  // Если месяц и день не указаны, выводим только год
  if (!month && !day) {
    return `${year}`;
  }

  // Формируем строку даты в формате "день месяц год", если все компоненты указаны
  return `${day ? day + ' ' : ''}${month ? month + ' ' : ''}${year}`;
}
function getRegion(country) {
  const regions = {
    'JP': 'Япония',
    'KR': 'Корея',
    'CN': 'Китай',
    'US': 'США',
    'FR': 'Франция',
    'DE': 'Германия',
    'GB': 'Великобритания',
    'IN': 'Индия'
  };
  return regions[country] || country;  
}
function getContentType(format, countryOfOrigin) {
  // Если это манга
  if (format === 'MANGA') {
    if (countryOfOrigin === 'JP') {
      return 'Манга (Япония)';
    }
    // Если это манхва
    if (countryOfOrigin === 'KR') {
      return 'Манхва';
    }
    // Если это маньхуа
    if (countryOfOrigin === 'CN') {
      return 'Маньхуа';
    }
    return 'Не является мангой/манхвой/маньхвой';
  }else if(format === 'NOVEL'){
      return 'Ранобэ';
  }
  
  return format || 'Не указан';
}




function getMonthName(monthNumber) {
  const months = [
    'Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня',
    'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'
  ];
  return months[monthNumber - 1];  // Месяцы начинаются с 1, поэтому -1
}
