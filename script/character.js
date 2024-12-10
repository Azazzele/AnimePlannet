import { getMonthName, getFormatText,getGenderInRussian, getBirthDateString,checkBirthday } from '../Ru/units.js'; 

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
  query ($id: Int, $asHtml: Boolean) {
    Character (id: $id) {
      name {
        full
      }
      image {
        large
      }
      description(asHtml: $asHtml)
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
            startDate {
              year
            }
          }
            
        }
      }
    }
  }
  `;

  const variables = {
    id: parseInt(characterId),  // Используем ID персонажа
    asHtml: true
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
    const gender = getGenderInRussian(character.gender); 
    const imageUrl = character.image ? character.image.large : 'https://via.placeholder.com/150?text=No+Image';
    const birthDate = character.dateOfBirth || {};
    const description = character.description || 'Описание не доступно';

    const birthDateString = getBirthDateString(birthDate);

    const birthdayIcon = checkBirthday(birthDate);


  const mediaItems = character.media.edges.length > 0 ? character.media.edges.map(edge => {
  const format = getFormatText(edge.node.format);
  const title = edge.node.title.romaji || 'Неизвестно';
  const coverImage = edge.node.coverImage.extraLarge || 'https://via.placeholder.com/150?text=No+Image';
  const startDateTitle = edge.node.startDate.year
  return `
      <a href="../page.html?name=${encodeURIComponent(title)}&id=${edge.node.id}" class="character-link">
        <img src="${coverImage}" alt="${title}" style="max-width: 100px; height: auto;">
        <div class="title_name">
          <div class="details"> <span>${title}</span></div>
          <div class="details"> 
            <p>${format}</p>
             <p>${startDateTitle}</p>   
          </div>
        </div>
      </a> 
  `;
}).join('') : '<li>Нет медиа-сериалов</li>';
  const collectionsCount = character.collections ? character.collections.length : 0;
  const listsCount = character.lists ? character.lists.length : 0;
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
          <h3 class="name">
            <span>${character.name.full}</span> 
            <span>${birthdayIcon}</span>
          </h3>
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
          <a href="#" class="icon-link" title="Редактировать" onclick="editCharacter()"><i class="fa fa-edit"></i>
          <span class="icon-text">Редактировать</span>
          </a>
        </div>

          
          <aside class="aside">
            <div class="collection_name">
                <h2>В Коллекциях <span id="countCollection">${collectionsCount}</span></h2>
                <h2>В списках у <span id="countLists">${listsCount}</span></h2>
            </div>
          </aside>    
        </div>
        
        <div class="info_charcter">
          <p>${description}</p>
          <div class="other_info">
            <h3>Дата рождения: ${birthDateString}</h3>
            <h3>Пол: ${gender}</h3>
          </div>
        </div>
        
        <div class="dnime_charcters">
          <ul class='list_anime'>
            ${mediaItems}
          </ul>
        </div>
      </div>
    `;
  }

}

  
 function handleError(error) {
  console.error('Ошибка при получении данных:', error);
  characterDetailsContainer.innerHTML = `
    <p>Произошла ошибка при загрузке данных.</p>
    <p>Попробуйте позже.</p>
  `;
}
function addToCollection() {
  alert('Персонаж добавлен в коллекцию!');
}

function shareCharacter() {
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({
      title: characterName,
      url: url
    })
    .then(() => console.log('Успешно поделились!'))
    .catch((error) => console.error('Ошибка при попытке поделиться:', error));
  } else {
    alert('Ваш браузер не поддерживает функцию обмена. Скопируйте ссылку: ' + url);
  }
}

function makeFavorite() {
  alert('Персонаж добавлен в избранное!');
}

// Новая функция для редактирования персонажа
function editCharacter() {
  const newName = prompt('Введите новое имя персонажа:', characterName);
  if (newName !== null && newName.trim() !== '') {
    // Если имя изменено, обновляем его
    characterDetailsContainer.querySelector('h3').textContent = newName;
    alert('Имя персонажа обновлено на: ' + newName);
  } else {
    alert('Имя не было изменено.');
  }
}