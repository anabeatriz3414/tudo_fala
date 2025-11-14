function toggleMenu() {
    const menu = document.getElementById('menu');
    if (menu.style.display === 'none' || menu.style.display === '') {
        menu.style.display = 'block';
    } else {
        menu.style.display = 'none';
    }
}

// Fechar menu quando clicar fora
document.addEventListener('click', function(event) {
    const userPhoto = document.getElementById('user-photo');
    const menu = document.getElementById('menu');
    if (!userPhoto.contains(event.target)) {
        menu.style.display = 'none';
    }
});

//nome do usuario ao lado da foto
document.addEventListener('click', function(event) {
    const userPhoto = document.getElementById('user-photo');
    const menu = document.getElementById('menu');
    if (!userPhoto.contains(event.target)) {
        menu.style.display = 'none';
    }
});

// adiciona saudação com o nome do usuário
document.addEventListener('DOMContentLoaded', function() {
    const greetingEl = document.getElementById('user-greeting');
    if (!greetingEl) return;

    // tenta obter o nome do localStorage
    let username = localStorage.getItem('username');

    // fallback: tenta ler ?username=Nome na querystring
    if (!username) {
        const params = new URLSearchParams(window.location.search);
        username = params.get('username');
    }

    if (username) {
        greetingEl.textContent = `Olá, ${username}`;
    } else {
        greetingEl.textContent = 'Olá';
    }
});


  let isDark = false;

  function toggleTheme() {
    isDark = !isDark;
    document.body.classList.toggle('dark-mode');

    const icon = document.getElementById('themeIcon');
    icon.src = isDark ? '/assents/img/2.png' : '/assents/img/3.png';
    icon.alt = isDark ? 'Lua' : 'Sol';
  }

document.addEventListener("DOMContentLoaded", function () {
  const username = localStorage.getItem("username");
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || {};
  const dadosUsuario = usuarios[username] || {};

  if (dadosUsuario.foto) {
    const avatar = document.getElementById("avatar-principal");
    if (avatar) {
      avatar.src = dadosUsuario.foto;
    }
  }
});

// Slider de imagens

  let index = 0;
  const slides = document.querySelector('.slides');
  const totalSlides = document.querySelectorAll('.slides img').length;

  function showSlide(n) {
    index = (n + totalSlides) % totalSlides;
    slides.style.transform = `translateX(${-index * 100}%)`;
  }

  document.querySelector('.next').addEventListener('click', () => showSlide(index + 1));
  document.querySelector('.prev').addEventListener('click', () => showSlide(index - 1));

  // Passagem automática
  setInterval(() => showSlide(index + 1), 4000);

document.addEventListener('DOMContentLoaded', function () {
  const slidesEl = document.querySelector('.slides');
  const slideImgs = document.querySelectorAll('.slides img');
  const btnNext = document.querySelector('.carousel .next');
  const btnPrev = document.querySelector('.carousel .prev');

  if (!slidesEl || slideImgs.length === 0) return; // nada a fazer se não existir

  const totalSlides = slideImgs.length;
  let index = 0;
  let intervalId = null;
  const delay = 4000; // ms entre slides

  // garante largura correta: cada imagem já é 100% com flex, mas mantemos lógica robusta
  function update() {
    slidesEl.style.transform = `translateX(${-index * 100}%)`;
  }

  function nextSlide() {
    index = (index + 1) % totalSlides;
    update();
  }
  function prevSlide() {
    index = (index - 1 + totalSlides) % totalSlides;
    update();
  }

  // botões
  if (btnNext) btnNext.addEventListener('click', () => { nextSlide(); restartAuto(); });
  if (btnPrev) btnPrev.addEventListener('click', () => { prevSlide(); restartAuto(); });

  // autoplay
  function startAuto() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(nextSlide, delay);
  }
  function stopAuto() {
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
  }
  function restartAuto() { stopAuto(); startAuto(); }

  // pausar autoplay ao passar o mouse (opcional)
  const carouselEl = document.querySelector('.carousel');
  if (carouselEl) {
    carouselEl.addEventListener('mouseenter', stopAuto);
    carouselEl.addEventListener('mouseleave', startAuto);
  }

  // começa autoplay
  startAuto();

  // acessibilidade: trocar via teclado (esquerda/direita)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { nextSlide(); restartAuto(); }
    if (e.key === 'ArrowLeft') { prevSlide(); restartAuto(); }
  });

  // atualização inicial
  update();
});

// Verifica progresso salvo
let progresso = localStorage.getItem("progressoExercicios") || 1;

function atualizarStatus() {
  document.querySelectorAll(".exercicio-card").forEach((card, index) => {
    const numero = index + 1;
    if (numero <= progresso) {
      card.classList.remove("bloqueado");
      card.classList.add("ativo");
      card.querySelector(".cajado").src = "/assents/img/icon-aberto.png";
      const botao = card.querySelector("button");
      botao.textContent = "Ver mais";
      botao.disabled = false;
      botao.className = "btn-ver-mais";
    }
  });
}

atualizarStatus();

document.querySelectorAll(".btn-ver-mais").forEach(botao => {
  botao.addEventListener("click", () => {
    const id = parseInt(botao.dataset.id);
    window.location.href = `exercicio${id}.html`;
    localStorage.setItem("progressoExercicios", id + 1);
  });
});
