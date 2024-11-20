// Получаем параметры из URL
const urlParams = new URLSearchParams(window.location.search);

// Логируем весь URL для отладки
console.log("Current URL:", window.location.href);

// Логируем значение параметра 'id'
const characterId = urlParams.get('id');
console.log("Полученный параметр ID:", characterId); // Логируем полученный ID

if (!characterId || isNaN(characterId)) {
    // Если ID пустой или некорректный, показываем ошибку
    console.error('Ошибка: ID персонажа не указан или указан некорректно.');
    document.querySelector('#character-details').innerHTML = '<p>Ошибка: ID персонажа не указан или указан некорректно.</p>';
} else {
    // Инициализация правильного селектора для страницы персонажа
    const characters_list = document.querySelector('#character-page');
    const characterDetailsContainer = document.querySelector('#character-details');

    // ГрафQL-запрос для получения подробной информации о персонаже
    const query = `
    query ($id: Int) {
      Character(id: $id) {
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
    }
    `;

    const variables = {
        id: parseInt(characterId)  // Используем ID персонажа из URL
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
        .then(handleCharacterData)
        .catch(handleError);
}

function handleResponse(response) {
    if (!response.ok) {
        throw new Error('Сетевая ошибка');
    }
    return response.json();
}

function handleCharacterData(data) {
    const character = data.data.Character;

    // Логируем image, чтобы убедиться в правильности URL
    console.log('Character Image:', character.image);

    // Подготовка данных
    const imageUrl = character.image && character.image.large ? character.image.large : 'https://via.placeholder.com/150?text=No+Image';
    const birthDate = character.dateOfBirth ? 
      `${character.dateOfBirth.day || 'Не указан'}/${character.dateOfBirth.month || 'Не указан'}/${character.dateOfBirth.year || 'Не указан'}` : 
      'Не указано';
    const rating = character.age || 'Не указан';
    const animeRoles = character.animeRoles.edges.map(edge => `<li>${edge.node.media.title.romaji}</li>`).join('');

    // Создаем элемент для персонажа
    const characterCard = document.createElement('div');
    characterCard.classList.add('character-card');

    characterCard.innerHTML = `
        <div class="character-image">
            <img src="${imageUrl}" alt="${character.name.full}">
        </div>
        <div class="character-info">
            <h2>${character.name.full}</h2>
            <p><strong>Описание:</strong> ${character.description || 'Описание не доступно'}</p>
            <p><strong>Дата рождения:</strong> ${birthDate}</p>
            <p><strong>Пол:</strong> ${character.gender || 'Не указан'}</p>
            <p><strong>Возраст:</strong> ${rating}</p>
            <h3>Роли в аниме:</h3>
            <ul>
                ${animeRoles || '<li>Роли не найдены</li>'}
            </ul>
        </div>
    `;

    // Добавляем карточку персонажа в список
    characters_list.appendChild(characterCard);
    characters_list.classList.add('loaded');
}

function handleError(error) {
    console.error('Ошибка при получении данных:', error);
    document.querySelector('#character-details').innerHTML = '<p>Ошибка при загрузке данных. Попробуйте позже.</p>';
}
