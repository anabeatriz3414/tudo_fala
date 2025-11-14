document.addEventListener("DOMContentLoaded", function () {
  const plano = localStorage.getItem("planoSelecionado");
  const username = localStorage.getItem("username");
  const planoDetalhes = document.getElementById("plano-detalhes");
  const formPagamento = document.getElementById("form-pagamento");
  const mensagemFinal = document.getElementById("mensagem-final");

  if (!username) {
    window.location.href = "login.html";
    return;
  }

  if (!plano) {
    planoDetalhes.innerHTML = "<p>Nenhum plano selecionado. Volte e escolha um plano.</p>";
    return;
  }

  const planosInfo = {
    Free: {
      titulo: "Plano Free 💧",
      beneficios: [
        "Acesso a atividades básicas",
        "Vídeos gratuitos do YouTube",
        "Sem custo"
      ],
      pago: false
    },
    Basic: {
      titulo: "Plano Basic 🌊",
      beneficios: [
        "Atividades guiadas por especialistas",
        "Vídeos exclusivos da plataforma",
        "Metas semanais e feedback automático"
      ],
      pago: true
    },
    Premium: {
      titulo: "Plano Premium 🐬",
      beneficios: [
        "Escolha de nível e foco",
        "Desafios personalizados",
        "Consultas por chamada com profissionais",
        "Filtro por estilo de profissional",
        "Agendamento flexível ou atendimento imediato"
      ],
      pago: true
    }
  };

  const planoInfo = planosInfo[plano];
  if (!planoInfo) return;

  planoDetalhes.innerHTML = `
    <h2>${planoInfo.titulo}</h2>
    <ul>${planoInfo.beneficios.map(b => `<li>${b}</li>`).join("")}</ul>
  `;

  if (planoInfo.pago) {
    formPagamento.style.display = "block";
    document.getElementById("pagamento-form").addEventListener("submit", function (e) {
      e.preventDefault();

      // Simulação de pagamento
      mensagemFinal.textContent = "Pagamento realizado com sucesso! Seu plano foi ativado.";
      formPagamento.style.display = "none";

      // Aqui você poderia salvar o plano no perfil do usuário
    });
  } else {
    mensagemFinal.textContent = "Você escolheu o plano gratuito. Aproveite os recursos disponíveis!";
  }
});
