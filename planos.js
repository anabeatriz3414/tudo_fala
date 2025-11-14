document.addEventListener("DOMContentLoaded", function () {
  const botoes = document.querySelectorAll(".plano button");
  const mensagem = document.getElementById("mensagem-plano");
  const painelLogin = document.getElementById("painel-login"); // painel oculto no HTML

  botoes.forEach((botao) => {
    botao.addEventListener("click", function () {
      const planoSelecionado = this.parentElement.getAttribute("data-plano");
      const usuarioLogado = localStorage.getItem("username");

      if (!usuarioLogado) {
        // Usuário não está logado → mostrar painel de login
        if (painelLogin) {
          painelLogin.style.display = "block";
          mensagem.textContent = "Você precisa estar logado para escolher um plano.";
          mensagem.style.color = "#e74c3c";
        }
        return;
      }

      // Usuário está logado → salvar plano e redirecionar
      localStorage.setItem("planoSelecionado", planoSelecionado);

      if (planoSelecionado === "Free") {
        window.location.href = "homelogin.html";
      } else {
        window.location.href = "/pages/pagamento.html";
      }
    });
  });
});
