//Статус тайтла
export function getStatusText(status) {
  switch (status) {
    case 'FINISHED': return 'Завершено';
    case 'RELEASING': return 'В процессе';  // Исправляем здесь
    case 'NOT_YET_RELEASED': return 'Не выпущено';
    case 'CANCELLED': return 'Отменено';
    case 'HIATUS': return 'Приостановлено';
    default: return 'Неизвестный статус';
  }
}
//Форматы на руссков
export function getFormatText(format) {
  switch(format) {
    case 'TV': return 'Тв сериал';
    case 'OVA': return 'OVA';
    case 'MOVIE': return 'Фильм';
    case 'MUSIC': return 'Музыкальное видео';
    case 'SPECIAL': return 'Специальный эпизод';
    case 'ONA': return 'ONA';
    case 'MANGA': return 'Манга';
    case 'NOVEL': return 'Ранобэ';
    default: return 'Неизвестный формат';
  }
}
export function getGenres(genres) {
  // Используем map для каждого жанра из массива
  return genres.map(genre => {
    switch (genre) {
      case 'Action':
        return 'Экшн';
      case 'Adventure':
        return 'Приключения';
      case 'Comedy':
        return 'Комедия';
      case 'Drama':
        return 'Драма';
      case 'Fantasy':
        return 'Фэнтези';
      case 'Horror':
        return 'Ужасы';
      case 'Mystery':
        return 'Мистика';
      case 'Romance':
        return 'Романтика';
      case 'Sci-Fi':
        return 'Научная фантастика';
      case 'SliceOfLife':
        return 'Слайс оф лайф';
      case 'Supernatural':
        return 'Сверхъестественное';
      case 'Thriller':
        return 'Триллер';
      case 'Mecha':
        return 'Меха';
      case 'Sports':
        return 'Спортивное';
      case 'Music':
        return 'Музыка';
      case 'Psychological':
        return 'Психологическое';
      case 'Military':
        return 'Военное';
      case 'Historical':
        return 'Историческое';
      case 'Magic':
        return 'Магия';
      case 'Shounen':
        return 'Шонен';
      case 'Shoujo':
        return 'Сёдзё';
      case 'Seinen':
        return 'Сейнен';
      case 'Josei':
        return 'Дзёсэй';
      case 'Harem':
        return 'Гарем';
      case 'Slice of Life':
        return 'Повседневность';   
      default:
        return genre;  // Если жанр не найден, возвращаем оригинальное значение
    }
  }).join(', '); // Возвращаем строку с жанрами, разделёнными запятой
}
export function getSesone(sesone){
  switch (sesone) {
    case 'SUMMER':{
        return 'Лето';
      }
      case 'WINTER':{
        return 'Зима';
      }
      case 'SPRING':{
          return 'Весна';
      }
      case 'FALL':{
          return 'Осень';
      }
  }
}
// Функция для получения имени месяца по его номеру
export function getMonthName(monthNumber) {
    const months = [
      'Января', 'Февраля', 'Марта', 'Апреля', 'Майа', 'Июня',
      'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабрья'
    ];
    return months[monthNumber - 1] || 'Неизвестно'; // monthNumber начинается с 1
}
// Функция для получения пола на русском
export function getGenderInRussian(gender) {
    switch (gender) {
      case 'Male':
        return 'Мужской';
      case 'Female':
        return 'Женский';
      default:
        return 'Неизвестно';
    }
}
// Массив для перевода числового месяца в название
const monthNames = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];
// Функция для получения строки даты рождения
export function getBirthDateString(birthDate) {
    const day = birthDate.day != null ? birthDate.day : null;
    const month = birthDate.month != null ? monthNames[birthDate.month - 1] : null; // Месяц приходит от 1 до 12
    const year = birthDate.year != null ? birthDate.year : null;

    // Если все значения неопределены, возвращаем "Неизвестно"
    if (day === null && month === null && year === null) {
        return 'Неизвестно';
    }

    // Если хотя бы одно значение неопределено, заменяем его на "Неизвестно"
    const dateString = `${day !== null ? day : ''} ${month !== null ? month : ''} ${year !== null ? year : ''}`.trim();

    return dateString || 'Неизвестно'; // Если строка пустая, то возвращаем "Неизвестно"
}
// Функция для проверки, является ли сегодня день рождения персонажа
export function checkBirthday(birthDate) {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1; // В JavaScript месяцы начинаются с 0, поэтому прибавляем 1

    if (birthDate.day && birthDate.month && birthDate.day === currentDay && birthDate.month === currentMonth) {
      return `
        <div class="birthday-celebration">
          <i class="fa-solid fa-cake-candles"></i>
        </div>
      `;
    }
    return ''; // Возвращаем пустую строку, если сегодня не день рождения
}
