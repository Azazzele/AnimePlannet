const birthday_list = document.getElementById('birthday-list');

// Запрос на получение персонажей с днями рождения
const newAnimeQuery = `
query($isBirthday: Boolean) {
    Page {
        characters(isBirthday: $isBirthday) {
            id
            name {
                full
            }
            dateOfBirth {
                day
                month
                year
            }
            image {
                large
            }
        }
    }
}
`;

// Переменные для запроса
const variables = {
    isBirthday: true, // Устанавливаем значение для фильтра по дням рождения (можно изменить на false, если не нужны только дни рождения)
};

const url = 'https://graphql.anilist.co';
const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    body: JSON.stringify({
        query: newAnimeQuery,
        variables: variables,
    }),
};

fetch(url, options)
    .then(handleResponse) // Обрабатываем ответ
    .then(handleData) // Обрабатываем данные
    .catch(handleError); // Обрабатываем ошибки

// Функция для обработки ответа
function handleResponse(response) {
    if (!response.ok) {
        throw new Error('Сетевая ошибка');
    }
    return response.json();
}

// Функция для обработки данных
function handleData(data) {
    console.log('Received Data:', data);

    const characters = data.data.Page.characters;
    
    if (characters.length === 0) {
        birthday_list.innerHTML = "<p>Нет персонажей с днем рождения сегодня.</p>";
        return;  // Прерываем выполнение, если нет данных
    }

    const randomAnime = getRandomItems(characters, 6);

    // Очищаем список перед добавлением новых персонажей
    birthday_list.innerHTML = '';

    // Строим HTML-контент
    const htmlContent = randomAnime.map(element => {
        const { id, name, image } = element;
        const img = image ? image.large : 'default-image.jpg'; // Если изображения нет, подставляем изображение по умолчанию

        return `
            <div class="card_title">
				
                <a href="html/character.html?id=${id}&name=${encodeURIComponent(name.full)}">
                    <div class="poster">
                        <img src="${img}" alt="${name.full}">
                    </div>
                    <div class="info">
                        <h2>${name.full}</h2>
                    </div>
                </a>
            </div>
        `;
    }).join('');

    // Вставляем HTML-контент
    birthday_list.innerHTML = htmlContent;
}

function getRandomItems(arr, num) {
    const shuffled = arr.slice(0);
    let i = arr.length, randomIndex, tempValue;

    while (i--) {
        randomIndex = Math.floor(Math.random() * (i + 1));
        tempValue = shuffled[i];
        shuffled[i] = shuffled[randomIndex];
        shuffled[randomIndex] = tempValue;
    }

    return shuffled.slice(0, num);
}

// Функция для обработки ошибок
function handleError(error) {
    console.error('Ошибка при получении данных:', error);
}
