document.addEventListener('DOMContentLoaded', () => {
    // Функция для получения массива жанров
    function getGenres() {
        return [
            { id: 'action', name: 'Экшен', imageUrl: 'https://img.freepik.com/free-photo/mythical-dragon-beast-anime-style_23-2151112836.jpg?ga=GA1.1.357281446.1732629604&semt=ais_hybrid' },
            { id: 'romance', name: 'Романтика', imageUrl: 'https://t4.ftcdn.net/jpg/07/87/06/43/360_F_787064350_kZLKtFRKGuki3u6TmvqRfuRzGwWcyA2u.jpg' },
            { id: 'horror', name: 'Ужасы', imageUrl: 'https://img.freepik.com/premium-photo/creepy-scary-anime-girl-generative-ai_739548-16755.jpg' },
            { id: 'comedy', name: 'Комедия', imageUrl: 'https://avatars.dzeninfra.ru/get-zen_doc/3445317/pub_5f00c99afdc79f525c416200_5f00cbc9a4bb5f6ea16c9edf/scale_1200' },
            { id: 'drama', name: 'Драма', imageUrl: 'https://img.freepik.com/free-photo/medium-shot-anime-characters-hugging_23-2150970861.jpg?t=st=1733845816~exp=1733849416~hmac=63ff5261dd52dfe88bfbbb36a6df16c7c3bbde43172d7fb5f7e0c5b6e423cb8f&w=1480' },
            { id: 'fantasy', name: 'Фэнтези', imageUrl: 'https://img.freepik.com/free-photo/mythical-dragon-beast-anime-style_23-2151112837.jpg?t=st=1733845846~exp=1733849446~hmac=d595546909c21eddc1af9d749a35b1d55996665a78160b56c600ef4c1d579334&w=1480' },
            { id: 'mystery', name: 'Мистерия', imageUrl: 'https://img.freepik.com/free-photo/black-white-illustration-man-with-short-hair-black-white-face_188544-12868.jpg?t=st=1733845946~exp=1733849546~hmac=180890cca3f27d29e8e7fd93e82d84f5090ddec8424deda4ff978a43bc2eb873&w=1480' },
            { id: 'adventure', name: 'Приключения', imageUrl: 'https://play-lh.googleusercontent.com/nDPZQjCtSwW7vkJzLPISmowtB8TwesQl4DoPH5nT_ucjAIodLaHZt_pEfHV9ffR9vOI=w1024-h500' },
            { id: 'thriller', name: 'Триллер', imageUrl: 'https://cdn.kanobu.ru/editor/images/76/fe688ab9-a3a2-445f-b6d0-cfdd3c4e73f8.webp' },
            { id: 'sci-fi', name: 'Научная фантастика', imageUrl: 'https://img.freepik.com/free-photo/anime-character-using-virtual-reality-glasses-metaverse_23-2151568818.jpg?t=st=1733845864~exp=1733849464~hmac=0c2f014d31c5a15cd9805f154991cdb8aef14b97297b38e0da77e4bb9716aa77&w=1380' },
            { id: 'superhero', name: 'Супергерои', imageUrl: 'https://img.goodfon.ru/wallpaper/big/8/a2/boku-no-hero-academia-art-anime-geroi-moia-geroiskaia-akad-4.webp' },
            { id: 'historical', name: 'Исторический', imageUrl: 'https://img.goodfon.ru/wallpaper/big/b/4e/anime-tania-voennaia-khronika-malenkoi-devochki-youjo-senki.webp' },
            { id: 'slice-of-life', name: 'Повседневность', imageUrl: 'https://c.wallhere.com/images/2a/47/50a9e12d6374d865f3eecd9778b8-2294336.png!d' }
        ];
    }

    // Функция для случайного выбора N элементов из массива
    function getRandomGenres(arr, n) {
        const shuffled = arr.sort(() => 0.5 - Math.random()); // Перемешиваем массив случайным образом
        return shuffled.slice(0, n); // Возвращаем первые N элементов
    }

    // Функция для создания вкладки
    function createTab(genre) {
        const tabButton = document.createElement('a');
        tabButton.href = `../html/anilist.html?genre=${genre.id}`; // Формируем ссылку
        tabButton.classList.add('tab-button');
        tabButton.setAttribute('data-tab', genre.id);
        tabButton.innerHTML = `<span>${genre.name}</span>`; // Вставляем имя жанра

        // Устанавливаем фоновое изображение для вкладки
        tabButton.style.backgroundImage = `url(${genre.imageUrl})`;
        tabButton.style.backgroundSize = 'cover'; // Устанавливаем размер фона по размеру элемента
        tabButton.style.backgroundPosition = 'center'; // Центрируем изображение на вкладке

        return tabButton;
    }

    // Получаем контейнеры
    const tabsContainer = document.querySelector('.tabs');
    const tabsAllGenresContainer = document.querySelector('.tabsallgenre');

    // Проверяем и добавляем случайные жанры в случайный контейнер
    if (tabsContainer) {
        const genres = getGenres();
        const randomGenres = getRandomGenres(genres, 3);
        randomGenres.forEach(genre => {
            tabsContainer.appendChild(createTab(genre));
        });
    }

    // Проверяем и добавляем все жанры в контейнер всех жанров
    if (tabsAllGenresContainer) {
        const genres = getGenres();
        genres.forEach(genre => {
            tabsAllGenresContainer.appendChild(createTab(genre));
        });
    }
});
