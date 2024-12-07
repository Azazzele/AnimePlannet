// Получаем параметры из URL
const urlParams = new URLSearchParams(window.location.search);
const characterId = urlParams.get('id');  // ID персонажа
const characterName = decodeURIComponent(urlParams.get('name'));  // Имя персонажа

const characterDetailsContainer = document.querySelector('#character-details');

// Проверка на наличие необходимых параметров
if (!characterId || !characterName) {
  characterDetailsContainer.innerHTML = '<p>Необходимые параметры не указаны в URL.</p>';
} else {
  // ГрафQL-запрос для получения подробной информации о персонаже
  const query = `
  query ($id: Int) {
    Character (id: $id) {
      name {
        full
      }
      image {
        large
      }
      description
      dateOfBirth {
        day
        month
        year
      }
      gender 
      media {
        edges {
          node {
            id
            format
            title {
              romaji
              english
              native
            }
            coverImage {
              extraLarge
            }
          }
            
        }
      }
    }
  }
  `;

  const variables = {
    id: parseInt(characterId)  // Используем ID персонажа
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
    .then(handleResponse)
    .then(handleData)
    .catch(handleError);

  function handleResponse(response) {
    if (!response.ok) {
      throw new Error('Сетевая ошибка');
    }
    return response.json();
  }

  function handleData(data) {
    const character = data.data.Character;
    const gender = character.gender || 'Неизвестно';  // Пол
    const imageUrl = character.image ? character.image.large : 'https://via.placeholder.com/150?text=No+Image';
    const birthDate = character.dateOfBirth || {};
    const description = character.description || 'Описание не доступно';

    // Проверяем и выводим дату рождения
    const birthDateString = getBirthDateString(birthDate);

    // Проверка на день рождения персонажа
    const birthdayIcon = checkBirthday(birthDate);

    // Обработка медиа-сериалов
    const mediaItems = character.media.edges.length > 0 ? character.media.edges.map(edge => {
      const format = edge.node.format || 'Неизвестно';
      const title = edge.node.title.romaji || 'Неизвестно';
      const coverImage = edge.node.coverImage.extraLarge || 'https://via.placeholder.com/150?text=No+Image';

      return `
        <li>
          <a href="../page.html?name=${encodeURIComponent(title)}&animeId=${edge.node.id}" class="character-link">
            <img src="${coverImage}" alt="${title}" style="max-width: 100px; height: auto;">
            <div class="title_name">
              <div class="details"> <span>${title}</span></div>
              <div class="details"> <span>${format}</span></div>
            </div>
          </a> 
        </li>
      `;
    }).join('') : '<li>Нет медиа-сериалов</li>';

  // Обработка актеров озвучки
  const voiceActors = character.voiceActors && character.voiceActors.length > 0 ? character.voiceActors.map(actor => {
    const actorName = actor.name.full || 'Неизвестно';
    const actorImage = actor.image ? actor.image.large : 'https://via.placeholder.com/50?text=No+Image';
    const actorLanguage = actor.language || 'Неизвестно';

    return `
      <li>
        <div class="actor">
          <img src="${actorImage}" alt="${actorName}" style="width: 50px; height: 50px; border-radius: 50%;">
          <div>
            <span><strong>${actorName}</strong> (${actorLanguage})</span>
          </div>
        </div>
      </li>
    `;
  }).join('') : '<li>Нет информации об актерах озвучки</li>';
    characterDetailsContainer.innerHTML = `
      <div class="character-details">
        <div class="poster_info">
          <img src="${imageUrl}" alt="${character.name.full}">
          <h3>${character.name.full}</h3>
          
          <!-- Иконка дня рождения -->
          ${birthdayIcon}
          
        <div class="icon-container">
          <a href="#" class="icon-link" title="Добавить в коллекцию">
            <i class="fa fa-heart"></i>
            <span class="icon-text">Добавить в коллекцию</span> <!-- Текст, который будет показываться при наведении -->
          </a>
          <a href="#" class="icon-link" title="Поделиться">
            <i class="fa fa-share-alt"></i>
            <span class="icon-text">Поделиться</span> <!-- Текст, который будет показываться при наведении -->
          </a>
          <a href="#" class="icon-link" title="Сделать фаворитом">
            <i class="fa fa-bolt"></i>
            <span class="icon-text">Сделать фаворитом</span> <!-- Текст, который будет показываться при наведении -->
          </a>
        </div>

          
          <aside class="aside">
            <div class="collection_name">
                <h2>В Коллекциях<span class="" id="countCollection">1000</span></h2>
                <h2>В списка у <span class="" id="countCollection">1000</span></h2>
            </div>
          </aside>    
        </div>
        
        <div class="info_charcter">
          <p>${description}</p>
          <h3>Дата рождения: ${birthDateString}</h3>
          <h3>Пол: ${gender}</h3>
        </div>
        <div class="dnime_charcters">
          <ul class='list_anime'>
            ${mediaItems}
          </ul>
        </div>
      </div>
    `;
  }

  // Функция для получения имени месяца по его номеру
  function getMonthName(monthNumber) {
    const months = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    return months[monthNumber - 1] || 'Неизвестно'; // monthNumber начинается с 1
  }

  // Функция для получения строки даты рождения
  function getBirthDateString(birthDate) {
    const day = birthDate.day != null ? birthDate.day : 'Неизвестно';
    const month = birthDate.month != null ? getMonthName(birthDate.month) : 'Неизвестно';
    const year = birthDate.year != null ? birthDate.year : 'Неизвестно';
    return `${day} ${month} ${year}`;
  }

  // Функция для проверки, является ли сегодня день рождения персонажа
  function checkBirthday(birthDate) {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1; // В JavaScript месяцы начинаются с 0, поэтому прибавляем 1

    if (birthDate.day === currentDay && birthDate.month === currentMonth) {
      return `
        <div class="birthday-celebration">
          <span>🎂 С Днем Рождения! 🎉</span>
        </div>
      `;
    }
    return ''; // Возвращаем пустую строку, если сегодня не день рождения
  }

  function handleError(error) {
    console.error('Ошибка при получении данных:', error);
    characterDetailsContainer.innerHTML = '<p>Ошибка при загрузке данных. Попробуйте позже.</p>';
  }
}
