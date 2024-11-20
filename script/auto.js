document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Отменяем отправку формы
  
    // Сброс предыдущих ошибок
    const inputs = document.querySelectorAll("input");
    inputs.forEach(input => input.classList.remove("error"));
    const errors = document.querySelectorAll(".input-error");
    errors.forEach(error => error.style.display = "none");
  
    let isValid = true;
  
    // Проверка имени пользователя
    const username = document.getElementById("username");
    if (username.value.trim() === "") {
      username.classList.add("error");
      document.getElementById("username-error").style.display = "block";
      isValid = false;
    }
  
    // Проверка пароля
    const password = document.getElementById("password");
    if (password.value.trim() === "") {
      password.classList.add("error");
      document.getElementById("password-error").style.display = "block";
      isValid = false;
    }
  
    if (isValid) {
      alert("Авторизация успешна!");
      // Здесь можно отправить форму или выполнить другие действия
    }
  });
  