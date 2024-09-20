// Função para controlar o dropdown
function toggleDropdown() {
  // Seleciona o botão e o menu dropdown
  const dropdownToggle = document.getElementById('dropdownToggle');
  const dropdownMenu = document.querySelector('.dropdown-menu');

  // Verifica se os elementos foram encontrados
  if (!dropdownToggle || !dropdownMenu) {
    console.error('Dropdown elements not found. Check the HTML structure and IDs.');
    return;
  }

  // Alterna o submenu ao clicar no link "Opções"
  dropdownToggle.addEventListener('click', function (event) {
    event.preventDefault(); // Evita o comportamento padrão do link
    
    // Verifica se o dropdownMenu ainda está `null` por algum motivo
    if (!dropdownMenu) {
      console.error('Dropdown menu is null. Cannot toggle class.');
      return;
    }

    // Alterna a exibição do submenu
    dropdownMenu.classList.toggle('show'); // Adiciona ou remove a classe 'show'
  });

  // Fecha o submenu ao clicar fora dele
  document.addEventListener('click', function (event) {
    // Verifica se o clique foi fora do botão e do menu
    if (!dropdownToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
      dropdownMenu.classList.remove('show');
    }
  });
}

// Função para pesquisar notícias
function pesquisar() {
  let section = document.getElementById('resultados-pesquisa');
  let campoPesquisa = document.getElementById('campo-pesquisa').value.toLowerCase();

  // Verificação básica de null
  if (!section) {
    console.error('Resultados-pesquisa section not found.');
    return;
  }

  let resultados = '';
  let titulo = '';
  let descricao = '';
  let tag = '';

  for (let dado of noticias) {
    titulo = dado.titulo.toLowerCase();
    descricao = dado.descricao.toLowerCase();
    tag = dado.tag.toLowerCase();

    if (titulo.includes(campoPesquisa) || descricao.includes(campoPesquisa) || tag.includes(campoPesquisa)) {
      resultados += `
        <div class="item-resultado">
          <h2>
            <a href="#" target="_blank">${dado.titulo}</a>
          </h2>
          <p class="descricao-meta">${dado.descricao}</p>
          <a href="${dado.link}" target="_blank"> Mais Informações </a>
        </div>
      `;
    }
  }

  if (campoPesquisa === '') {
    section.innerHTML = '<h2> Sem Informações!</h2>';
    return;
  }

  section.innerHTML = resultados;
}
function generateTxt() {
  const fullname = document.getElementById('fullname').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const phone = document.getElementById('phone').value;
  const birthdate = document.getElementById('birthdate').value;
  const gender = document.getElementById('gender').value;

  const content = `
Nome Completo: ${fullname}
Email: ${email}
Senha: ${password}
Confirmar Senha: ${confirmPassword}
Telefone: ${phone}
Data de Nascimento: ${birthdate}
Gênero: ${gender}
`;

  console.log(content);

  // Cria um Blob com o conteúdo do texto
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  // Cria um link para fazer o download do arquivo
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dados_usuario.txt';
  a.click();

  // Limpa o URL do objeto criado
  URL.revokeObjectURL(url);
  alert('O arquivo "dados_usuario.txt" foi baixado. Verifique sua pasta de downloads.');
}

// Inicializa as funções ao carregar o DOM
document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM fully loaded and parsed');
  toggleDropdown();
});
