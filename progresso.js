document.addEventListener("DOMContentLoaded", function () {
  const atividades = JSON.parse(localStorage.getItem("atividadesFeitas")) || [];

  const metas = {
    diccao: 5,
    gestos: 4,
    respiracao: 3,
    nervosismo: 5
  };

  const progresso = {
    diccao: 0,
    gestos: 0,
    respiracao: 0,
    nervosismo: 0
  };

  atividades.forEach((atv) => {
    if (progresso[atv.tipo] !== undefined) {
      progresso[atv.tipo]++;
    }
  });

  Object.keys(progresso).forEach((tipo) => {
    const porcentagem = Math.min((progresso[tipo] / metas[tipo]) * 100, 100);
    document.querySelector(`.preenchido.${tipo}`).style.width = porcentagem + "%";
  });

  document.getElementById("total-atividades").textContent = atividades.length;

  const lista = document.getElementById("lista-atividades");
  atividades.forEach((atv) => {
    const li = document.createElement("li");
    li.textContent = `${atv.nome} (${atv.data})`;
    lista.appendChild(li);
  });

  const listaSugestoes = document.getElementById("lista-sugestoes");
  Object.keys(progresso).forEach((tipo) => {
    if (progresso[tipo] < metas[tipo]) {
      const restante = metas[tipo] - progresso[tipo];
      const li = document.createElement("li");
      li.textContent = `Faltam ${restante} atividades para melhorar sua ${tipo}.`;
      listaSugestoes.appendChild(li);
    }
  });
});
