let timeout;
const btn_up = document.getElementById('page_up');

function localWindow() {
    // Очистим предыдущий таймаут, чтобы не вызывать функцию слишком часто
    clearTimeout(timeout);

    // Установим новый таймаут, чтобы функция выполнилась через 100мс после завершения прокрутки
    timeout = setTimeout(function() {
        let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        console.log(scrollTop);  // Логируем положение прокрутки
        const navigate = document.querySelector('.navigate');
        const btn_up = document.getElementById('page_up');

        // Если прокрутили больше 120 пикселей, переключаем класс
        if (scrollTop > 50) {
            navigate.classList.add('active_nav');
            btn_up.classList.add('show')
            btnscrollTOp();

        }else{
            navigate.classList.remove('active_nav');
            btn_up.classList.remove('show')
        }


    }, 5);  // Таймаут на 100мс
}
function btnscrollTOp(){
    btn_up.addEventListener('click', ()=>{
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Плавная прокрутка
        });
    });
}

window.addEventListener('scroll', localWindow);
