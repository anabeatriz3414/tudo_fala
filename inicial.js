// --------------------------
// homelogin.js (ajustado)
// --------------------------

// Função para abrir/fechar o menu quando clicar na foto
function toggleMenu() {
  const menu = document.getElementById('menu');
  const backdrop = document.getElementById('backdrop');

  if (!menu) return;

  // comportamento diferente dependendo da largura
  if (window.innerWidth <= 900) {
    // mobile: usar painel full-screen
    menu.classList.toggle('mobile');
    menu.classList.toggle('show');
    if (backdrop) backdrop.classList.toggle('show');
  } else {
    // desktop: menu suspenso abaixo da foto
    menu.classList.toggle('show');
  }
}

// fechar menu ao clicar fora (desktop e mobile)
document.addEventListener('click', function (event) {
  const userPhoto = document.getElementById('user-photo');
  const menu = document.getElementById('menu');
  const backdrop = document.getElementById('backdrop');

  if (!menu || !userPhoto) return;

  // se clicou na foto, já é tratado por toggleMenu -> não executa o fechamento aqui
  if (userPhoto.contains(event.target)) return;

  // se clicar no backdrop, fecha todo mundo
  if (backdrop && backdrop.contains(event.target)) {
    menu.classList.remove('show');
    menu.classList.remove('mobile');
    backdrop.classList.remove('show');
    return;
  }

  // se o clique não estiver dentro do menu (desktop) e o menu estiver aberto, fecha
  if (!menu.contains(event.target) && menu.classList.contains('show') && window.innerWidth > 900) {
    menu.classList.remove('show');
  }

  // mobile: se menu mobile estiver aberto e clicou fora do menu (não no userPhoto), fecha
  if (window.innerWidth <= 900 && !menu.contains(event.target) && menu.classList.contains('mobile')) {
    menu.classList.remove('mobile');
    menu.classList.remove('show');
    if (backdrop) backdrop.classList.remove('show');
  }
});

// quando a janela for redimensionada, certifica que classes inconsistentes sejam removidas
window.addEventListener('resize', function () {
  const menu = document.getElementById('menu');
  const backdrop = document.getElementById('backdrop');
  if (!menu) return;
  if (window.innerWidth > 900) {
    // garantir que o menu mobile seja fechado
    menu.classList.remove('mobile');
    if (backdrop) backdrop.classList.remove('show');
  } else {
    // garantir que o desktop-dropdown não esteja ocupando a tela
    menu.classList.remove('show');
  }
});

// ---------- resto do seu JS original (mantido) ----------

// Depoimentos
const depoimentos = document.querySelectorAll('.depoimento');
const btnPrev = document.getElementById('prevDepoimento');
const btnNext = document.getElementById('nextDepoimento');
let currentIndex = 0;

function mostrarDepoimento(index) {
  depoimentos.forEach((dep, i) => {
    dep.style.display = i === index ? 'block' : 'none';
  });
}

if (depoimentos.length > 0 && btnPrev && btnNext) {
  btnPrev.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + depoimentos.length) % depoimentos.length;
    mostrarDepoimento(currentIndex);
  });

  btnNext.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % depoimentos.length;
    mostrarDepoimento(currentIndex);
  });

  mostrarDepoimento(currentIndex);
}

// Modal login e criar conta
const btnCriarConta = document.getElementById('btnCriarConta');
const modalLogin = document.getElementById('modalLogin');
const modalCriarConta = document.getElementById('modalCriarConta');
const closeLogin = document.getElementById('closeLogin');
const closeCriar = document.getElementById('closeCriar');
const areaRestrita = document.getElementById('areaRestrita');
const mainSections = [...document.querySelectorAll('main > section:not(#areaRestrita)')];
const btnSair = document.getElementById('btnSair');
const logo = document.getElementById('logo');

let usuarios = JSON.parse(localStorage.getItem('usuarios')) || {};

function abrirModal(modal) { if(modal){ modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; } }
function fecharModal(modal) { if(modal){ modal.style.display = 'none'; document.body.style.overflow = ''; } }

const btnLogin = document.getElementById('btnLogin');
if (btnLogin) {
  btnLogin.addEventListener('click', () => abrirModal(modalLogin));
}
if (btnCriarConta) {
  btnCriarConta.addEventListener('click', () => abrirModal(modalCriarConta));
}
if (closeLogin) closeLogin.addEventListener('click', () => fecharModal(modalLogin));
if (closeCriar) closeCriar.addEventListener('click', () => fecharModal(modalCriarConta));

window.addEventListener('click', e => {
  if(e.target === modalLogin) fecharModal(modalLogin);
  if(e.target === modalCriarConta) fecharModal(modalCriarConta);
});

// Login unificado e redirecionamento
const formLogin = document.getElementById('formLogin');
if (formLogin) {
  formLogin.addEventListener('submit', e => {
    e.preventDefault();
    const user = e.target.loginUser.value.trim();
    const pass = e.target.loginPass.value;

    if (usuarios[user] && usuarios[user].senha === pass) {
      localStorage.setItem('username', user);
      localStorage.setItem('dadosUsuario', JSON.stringify(usuarios[user]));
      alert(`Bem-vindo(a), ${user}!`);
      fecharModal(modalLogin);
      e.target.reset();

      window.location.href = 'pages/homeLogin/homelogin.html';
    } else {
      alert('Usuário ou senha incorretos.');
    }
  });
}

// Criar conta
const formCriarConta = document.getElementById('formCriarConta');
if (formCriarConta) {
  formCriarConta.addEventListener('submit', e => {
    e.preventDefault();

    const user = e.target.newUser.value.trim();
    const pass = e.target.newPass.value;
    const email = e.target.newEmail.value;
    const telefone = e.target.newPhone.value;

    if(user in usuarios) {
      alert('Usuário já existe. Escolha outro.');
      return;
    }

    usuarios[user] = {
      senha: pass,
      nome: user,
      email: email,
      telefone: telefone,
      endereco: "",
      foto: ""
    };

    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    alert('Conta criada com sucesso! Agora faça login.');
    fecharModal(modalCriarConta);
    e.target.reset();
  });
}

// Logo volta para o início
if (logo) {
  logo.addEventListener('click', () => {
    if(areaRestrita && areaRestrita.style.display === 'block' && btnSair) {
      btnSair.click();
    }
    window.scrollTo({top:0, behavior:'smooth'});
  });
}

const linkParaLogin = document.getElementById('linkParaLogin');
if (linkParaLogin) {
  linkParaLogin.addEventListener('click', () => {
    fecharModal(modalCriarConta);
    abrirModal(modalLogin);
  });
}

const btPlano = document.getElementById('BT-SB');
if (btPlano) {
  btPlano.addEventListener('click', function() {
    window.location.href = 'pages/homeLogin/plano.html';
  });
}
