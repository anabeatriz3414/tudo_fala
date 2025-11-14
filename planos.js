// CARREGA DADOS DO LOCALSTORAGE
document.addEventListener("DOMContentLoaded", () => {
    const name = localStorage.getItem("userName");
    const photo = localStorage.getItem("userPhoto");

    if (name) document.getElementById("userName").textContent = name;
    if (photo) document.getElementById("userPhoto").src = photo;
});

// FUNÃ‡ÃƒO PARA ENVIAR PLANO CORRETO
function assinarPlano(plano, preco) {
    localStorage.setItem("planoEscolhido", plano);
    localStorage.setItem("precoPlano", preco);

    window.location.href = "pagamento.html";
}
