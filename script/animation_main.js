let timeout
const btn_up = document.getElementById('page_up')
const navigate = document.querySelector('.navigate') // Навигация
const threshold = 50 // Порог, после которого кнопка будет показываться

function localWindow() {
	// Очистим предыдущий таймаут, чтобы не вызывать функцию слишком часто
	clearTimeout(timeout)

	// Установим новый таймаут, чтобы функция выполнилась через 100мс после завершения прокрутки
	timeout = setTimeout(function () {
		let scrollTop =
			document.documentElement.scrollTop || document.body.scrollTop
		console.log(scrollTop) // Логируем положение прокрутки

		// Если прокрутили больше порога, активируем кнопки и навигацию
		if (scrollTop > threshold) {
			navigate.classList.add('active_nav')
			btn_up.classList.add('show') // Показываем кнопку
		} else {
			navigate.classList.remove('active_nav')
			btn_up.classList.remove('show') // Скрываем кнопку
		}
	}, 100) // Устанавливаем таймаут на 100мс, чтобы избежать частого вызова
}

function btnscrollTOp() {
	btn_up.addEventListener('click', () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth', // Плавная прокрутка
		})
	})
}

// Добавим слушатель события для прокрутки страницы
window.addEventListener('scroll', localWindow)

// Инициализируем кнопку прокрутки наверх
btnscrollTOp()
