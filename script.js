// Função que inicializa o sistema de notas
function initNotas() {
  // Elementos DOM principais
  const btnSalvarGeral = document.getElementById("btn-salvar-geral");
  const btnAdicionar = document.getElementById("btn-adicionar");
  const corpoTabela = document.getElementById("tabela-corpo");
  const seletorMateria = document.getElementById("seletor-materia");
  const inputArquivo = document.getElementById("arquivo");
  const btnLimpar = document.getElementById("btn-limpar");

  if (!corpoTabela || !seletorMateria || !inputArquivo) {
    console.warn('Elementos da página notas.html não encontrados. Script abortado.');
    return;
  }

  // ---------- Funções auxiliares Refatoradas ----------

  /**
   * Cria uma nova linha (TR) da tabela com os inputs.
   * @param {object} dados - Objeto com os dados do aluno { Nome, Matéria, Nota, Faltas }.
   * @returns {HTMLTableRowElement} A linha da tabela criada.
   */
  function criarLinha({ Nome = "", Matéria = "", Nota = "", Faltas = "" } = {}) {
    const linha = document.createElement("tr");
    linha.classList.add("border-b", "border-white/20");
    linha.innerHTML = `
      <td class="px-4 py-3">
        <input type="text" class="nome-input text-2xl w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg
          text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Nome" value="${Nome}">
      </td>
      <td class="px-4 py-3">
        <input type="text" class="materia-input text-2xl w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg
          text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Matéria..." value="${Matéria}">
      </td>
      <td class="px-4 py-3">
        <input type="number" class="nota-input text-2xl w-24 px-3 py-2 bg-white/20 border border-white/30 rounded-lg
          text-white text-center placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
          min="0" max="10" step="0.1" value="${Nota}">
      </td>
      <td class="px-4 py-3">
        <input type="number" class="falta-input text-2xl w-24 px-3 py-2 bg-white/20 border border-white/30 rounded-lg
          text-white text-center placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
          min="0" max="50" step="1" value="${Faltas}">
      </td>
      <td class="px-4 py-3 resultado text-white font-bold text-2xl"></td>
    `;
    return linha;
  }

  /**
   * Limpa todo o conteúdo do corpo da tabela.
   */
  function limparTabela() {
    corpoTabela.innerHTML = "";
  }

  /**
   * Define o valor da matéria para todas as linhas da tabela.
   * @param {string} materiaSelecionada - A matéria a ser definida.
   */
  function atualizarMaterias(materiaSelecionada) {
    const camposMateria = corpoTabela.querySelectorAll(".materia-input");
    camposMateria.forEach(input => {
      input.value = materiaSelecionada;
    });
  }

  /**
   * Calcula e exibe o resultado (Aprovado, Reprovado, etc.) para cada linha.
   */
  function calcularResultados() {
    const linhas = corpoTabela.querySelectorAll("tr");
    linhas.forEach(linha => {
      const inputNota = linha.querySelector(".nota-input");
      const inputFalta = linha.querySelector(".falta-input");
      const resultadoTd = linha.querySelector(".resultado");

      // Ignora se algum input não for encontrado na linha
      if (!inputNota || !inputFalta || !resultadoTd) return;

      const nota = parseFloat(inputNota.value);
      const falta = parseInt(inputFalta.value, 10);
      resultadoTd.classList.remove("text-green-300", "text-yellow-300", "text-red-300");

      let resultado = "";
      if (isNaN(nota) || isNaN(falta)) {
        resultado = "-";
      } else if (nota > 10) {
        resultado = "Nota > 10";
        resultadoTd.classList.add("text-red-300");
      } else if (nota >= 6 && falta <= 30) {
        resultado = "Aprovado";
        resultadoTd.classList.add("text-green-300");
      } else if (nota >= 5 && falta <= 30) {
        resultado = "Recuperação";
        resultadoTd.classList.add("text-yellow-300");
      } else {
        resultado = "Reprovado";
        resultadoTd.classList.add("text-red-300");
      }

      resultadoTd.textContent = resultado;
    });
  }

  /**
   * Limpa a tabela e a preenche com dados de um array de objetos JSON.
   * @param {Array<object>} jsonDados - Os dados para preencher a tabela.
   */
  function preencherTabelaComDados(jsonDados) {
    limparTabela(); // Garante que a tabela esteja vazia antes de adicionar novas linhas.

    if (!jsonDados || jsonDados.length === 0) {
      corpoTabela.appendChild(criarLinha()); // Adiciona uma linha em branco se o arquivo estiver vazio
      return;
    }
    
    jsonDados.forEach(linhaDados => {
      // As chaves (Nome, Matéria, Nota, Faltas) devem corresponder aos cabeçalhos da planilha.
      const novaLinha = criarLinha({
        Nome: linhaDados.Nome,
        Matéria: linhaDados.Matéria,
        Nota: linhaDados.Nota,
        Faltas: linhaDados.Faltas
      });
      corpoTabela.appendChild(novaLinha);
    });

    // Calcula os resultados imediatamente após carregar os dados.
    calcularResultados();
  }

  // ---------- Event Listeners ----------

  seletorMateria.addEventListener("change", () => {
    atualizarMaterias(seletorMateria.value);
  });

  btnAdicionar.addEventListener("click", () => {
    const novaLinha = criarLinha();
    if (seletorMateria.value) {
      novaLinha.querySelector(".materia-input").value = seletorMateria.value;
    }
    corpoTabela.appendChild(novaLinha);
  });

  // O botão de salvar agora apenas recalcula os resultados
  btnSalvarGeral.addEventListener("click", () => {
    calcularResultados();
  });

  // Limpa a tabela e adiciona uma nova linha em branco para começar
  btnLimpar.addEventListener("click", () => {
    limparTabela();
    corpoTabela.appendChild(criarLinha());
  });

  // Event listener para o input de arquivo
  inputArquivo.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        // Utiliza a biblioteca XLSX (SheetJS) que foi adicionada no index.html
        const workbook = XLSX.read(data, { type: "array" });

        const primeiraAbaNome = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[primeiraAbaNome];

        // Converte a planilha para JSON. defval: "" garante que células vazias se tornem strings vazias.
        const jsonDados = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        preencherTabelaComDados(jsonDados);
      } catch (error) {
        console.error("Erro ao processar o arquivo XLSX:", error);
        alert("Ocorreu um erro ao ler o arquivo. Verifique se o formato está correto.");
      }
    };
    reader.readAsArrayBuffer(file);
    
    // Limpa o valor do input para permitir carregar o mesmo arquivo novamente
    e.target.value = '';
  });

  // Inicializa a tabela com uma linha em branco ao carregar a página
  limparTabela();
  corpoTabela.appendChild(criarLinha());
}