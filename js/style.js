const valueGroups = [
  {
    name: "Identidade e autenticidade",
    values: [
      "Autenticidade",
      "Verdade",
      "Integridade",
      "Coerência",
      "Liberdade",
      "Propósito",
      "Espiritualidade",
      "Autonomia"
    ]
  },
  {
    name: "Crescimento e realização",
    values: [
      "Crescimento",
      "Aprendizado",
      "Excelência",
      "Evolução",
      "Realização",
      "Desenvolvimento",
      "Superação",
      "Sabedoria"
    ]
  },
  {
    name: "Liderança e impacto",
    values: [
      "Impacto",
      "Contribuição",
      "Influência",
      "Legado",
      "Coragem",
      "Responsabilidade",
      "Justiça",
      "Serviço"
    ]
  },
  {
    name: "Relacionamentos e conexão",
    values: [
      "Amor",
      "Família",
      "Amizade",
      "Cuidado",
      "Empatia",
      "Respeito",
      "Pertencimento",
      "Generosidade"
    ]
  },
  {
    name: "Segurança e estabilidade",
    values: [
      "Segurança",
      "Estabilidade",
      "Ordem",
      "Disciplina",
      "Consistência",
      "Comprometimento",
      "Confiança",
      "Equilíbrio"
    ]
  },
  {
    name: "Realização externa e expressão",
    values: [
      "Sucesso",
      "Reconhecimento",
      "Prosperidade",
      "Independência financeira",
      "Criatividade",
      "Inovação",
      "Expressão",
      "Beleza"
    ]
  },
  {
    name: "Qualidade de vida e bem-estar",
    values: [
      "Saúde",
      "Paz",
      "Alegria",
      "Felicidade",
      "Leveza",
      "Harmonia",
      "Presença",
      "Plenitude"
    ]
  }
];

const questions = [
  "O que esse valor significa para mim?",
  "Quando eu vivi esse valor plenamente?",
  "Quando eu traí esse valor?",
  "Como minha vida muda quando vivo esse valor?"
];

const state = {
  selected10: [],
  selected5: [],
  selected3: [],
  reflections: {}
};

const form = document.getElementById("valuesForm");
const nameInput = document.getElementById("name");
const valuesGrid = document.getElementById("valuesGrid");
const otherValue = document.getElementById("otherValue");
const addOtherButton = document.getElementById("addOtherButton");
const otherError = document.getElementById("otherError");

const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");
const step4 = document.getElementById("step4");
const step5 = document.getElementById("step5");

const selected10Grid = document.getElementById("selected10Grid");
const selected5Grid = document.getElementById("selected5Grid");
const reflectionContainer = document.getElementById("reflectionContainer");

const selected10Count = document.getElementById("selected10Count");
const selected5Count = document.getElementById("selected5Count");
const selected3Count = document.getElementById("selected3Count");

const step1Message = document.getElementById("step1Message");
const step2Message = document.getElementById("step2Message");
const step3Message = document.getElementById("step3Message");
const step4Message = document.getElementById("step4Message");
const step5Message = document.getElementById("step5Message");

const resultSection = document.getElementById("resultSection");
const resultGreeting = document.getElementById("resultGreeting");
const finalValues = document.getElementById("finalValues");
const reflectionResults = document.getElementById("reflectionResults");
const alignmentResult = document.getElementById("alignmentResult");

function normalizeValue(value) {
  return value.trim().replace(/\s+/g, " ");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showStep(step) {
  [step1, step2, step3, step4, step5].forEach((item) => {
    item.hidden = item !== step;
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function updateCounter(element, value) {
  element.textContent = value;
}

function renderValues() {
  valuesGrid.innerHTML = valueGroups
    .map(
      (group) => `
        <div class="value-group">
          <h3>${escapeHtml(group.name)}</h3>

          <div class="value-list">
            ${group.values
              .map(
                (value) => `
                  <div class="value-option">
                    <input
                      type="checkbox"
                      id="value-${createId(value)}"
                      value="${escapeHtml(value)}"
                      data-value="${escapeHtml(value)}"
                    >

                    <label for="value-${createId(value)}">
                      ${escapeHtml(value)}
                    </label>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      `
    )
    .join("");

  document
    .querySelectorAll('#valuesGrid input[type="checkbox"]')
    .forEach((input) => {
      input.addEventListener("change", handleValueSelection);
    });
}

function createId(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function handleValueSelection(event) {
  const value = event.target.dataset.value;

  if (event.target.checked) {
    if (state.selected10.length >= 10) {
      event.target.checked = false;
      showMessage(step1Message, "Você já escolheu 10 valores.");
      return;
    }

    state.selected10.push(value);
  } else {
    state.selected10 = state.selected10.filter((item) => item !== value);
  }

  updateCounter(selected10Count, state.selected10.length);
  updateStep1Availability();
  clearMessage(step1Message);
}

function updateStep1Availability() {
  document
    .querySelectorAll('#valuesGrid input[type="checkbox"]')
    .forEach((input) => {
      input.disabled =
        !input.checked && state.selected10.length >= 10;
    });
}

function addOtherValue() {
  clearMessage(step1Message);
  clearOtherError();

  const value = normalizeValue(otherValue.value);

  if (!value) {
    showOtherError("Digite um valor.");
    return;
  }

  if (value.includes(" ")) {
    showOtherError("Digite apenas 1 palavra.");
    return;
  }

  if (!/^[\p{L}\p{N}-]+$/u.test(value)) {
    showOtherError("Use apenas uma palavra, sem símbolos.");
    return;
  }

  const allValues = [
    ...valueGroups.flatMap((group) => group.values),
    ...state.selected10
  ];

  const exists = allValues.some(
    (item) => item.toLocaleLowerCase("pt-BR") === value.toLocaleLowerCase("pt-BR")
  );

  if (exists) {
    showOtherError("Esse valor já está na lista ou já foi selecionado.");
    return;
  }

  if (state.selected10.length >= 10) {
    showOtherError("Você já escolheu 10 valores.");
    return;
  }

  state.selected10.push(value);
  addCustomOptionToGrid(value);

  updateCounter(selected10Count, state.selected10.length);
  updateStep1Availability();

  otherValue.value = "";
}

function addCustomOptionToGrid(value) {
  let customGroup = document.getElementById("customGroup");

  if (!customGroup) {
    customGroup = document.createElement("div");
    customGroup.id = "customGroup";
    customGroup.className = "value-group";
    customGroup.innerHTML = `
      <h3>Meus valores</h3>
      <div class="value-list"></div>
    `;

    valuesGrid.appendChild(customGroup);
  }

  const list = customGroup.querySelector(".value-list");
  const optionId = `value-${createId(value)}`;

  list.insertAdjacentHTML(
    "beforeend",
    `
      <div class="value-option">
        <input
          type="checkbox"
          id="${optionId}"
          value="${escapeHtml(value)}"
          data-value="${escapeHtml(value)}"
          checked
        >

        <label for="${optionId}">
          ${escapeHtml(value)}
        </label>
      </div>
    `
  );

  const input = document.getElementById(optionId);
  input.addEventListener("change", handleValueSelection);
}

function renderSelectionGrid(container, values, groupName) {
  container.innerHTML = values
    .map(
      (value, index) => `
        <div class="selection-card">
          <input
            type="checkbox"
            id="${groupName}-${index}"
            value="${escapeHtml(value)}"
            data-value="${escapeHtml(value)}"
          >

          <label for="${groupName}-${index}">
            ${escapeHtml(value)}
          </label>
        </div>
      `
    )
    .join("");

  container.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", (event) => {
      handleReductionSelection(event, groupName);
    });
  });
}

function handleReductionSelection(event, groupName) {
  const value = event.target.dataset.value;
  const limit = groupName === "five" ? 5 : 3;
  const target = groupName === "five" ? "selected5" : "selected3";
  const counter = groupName === "five" ? selected5Count : selected3Count;

  if (event.target.checked) {
    if (state[target].length >= limit) {
      event.target.checked = false;
      showMessage(
        groupName === "five" ? step2Message : step3Message,
        `Escolha somente ${limit} valores.`
      );
      return;
    }

    state[target].push(value);
  } else {
    state[target] = state[target].filter((item) => item !== value);
  }

  updateCounter(counter, state[target].length);
  updateReductionAvailability(groupName);
  clearMessage(groupName === "five" ? step2Message : step3Message);
}

function updateReductionAvailability(groupName) {
  const target = groupName === "five" ? state.selected5 : state.selected3;
  const limit = groupName === "five" ? 5 : 3;
  const container = groupName === "five" ? selected10Grid : selected5Grid;

  container.querySelectorAll("input").forEach((input) => {
    input.disabled = !input.checked && target.length >= limit;
  });
}

function renderReflections() {
  reflectionContainer.innerHTML = state.selected3
    .map(
      (value, valueIndex) => `
        <article class="reflection-card">
          <div class="reflection-title">
            <div class="reflection-number">${valueIndex + 1}</div>
            <h3>${escapeHtml(value)}</h3>
          </div>

          ${questions
            .map(
              (question, questionIndex) => `
                <div class="field">
                  <label for="reflection-${valueIndex}-${questionIndex}">
                    ${questionIndex + 1}. ${question}
                  </label>

                  <textarea
                    id="reflection-${valueIndex}-${questionIndex}"
                    data-value-index="${valueIndex}"
                    data-question-index="${questionIndex}"
                    rows="3"
                    placeholder="Escreva sua reflexão..."
                  ></textarea>
                </div>
              `
            )
            .join("")}
        </article>
      `
    )
    .join("");
}

function validateReflections() {
  clearMessage(step4Message);

  const fields = reflectionContainer.querySelectorAll("textarea");
  const missing = [...fields].some((field) => !field.value.trim());

  if (missing) {
    showMessage(
      step4Message,
      "Responda todas as perguntas dos 3 valores antes de continuar."
    );
    return false;
  }

  state.reflections = {};

  state.selected3.forEach((value, valueIndex) => {
    state.reflections[value] = questions.map((_, questionIndex) => {
      return document.getElementById(
        `reflection-${valueIndex}-${questionIndex}`
      ).value.trim();
    });
  });

  return true;
}

function validateIntegration() {
  clearMessage(step5Message);

  const alignment = document.querySelector(
    'input[name="alignment"]:checked'
  );

  const reason = document.getElementById("alignmentReason");

  if (!alignment) {
    showMessage(step5Message, "Selecione uma opção de alinhamento.");
    return false;
  }

  if (!reason.value.trim()) {
    showMessage(step5Message, "Escreva sua reflexão final.");
    return false;
  }

  return true;
}

function showMessage(element, message) {
  element.textContent = message;
  element.hidden = false;
}

function clearMessage(element) {
  element.textContent = "";
  element.hidden = true;
}

function showOtherError(message) {
  otherError.textContent = message;
  otherError.style.display = "block";
}

function clearOtherError() {
  otherError.textContent = "";
  otherError.style.display = "none";
}

function validateName() {
  const card = nameInput.closest(".name-card");

  if (!nameInput.value.trim()) {
    card.classList.add("has-error");
    document.getElementById("nameError").style.display = "block";
    return false;
  }

  card.classList.remove("has-error");
  document.getElementById("nameError").style.display = "none";
  return true;
}

function showResult() {
  const name = escapeHtml(nameInput.value.trim());

  resultGreeting.textContent = name
    ? `${name}, estes são os valores que chegaram ao centro da sua análise.`
    : "Estes são os valores que chegaram ao centro da sua análise.";

  finalValues.innerHTML = state.selected3
    .map(
      (value, index) => `
        <div class="final-value">
          <small>VALOR ${index + 1}</small>
          <strong>${escapeHtml(value)}</strong>
        </div>
      `
    )
    .join("");

  reflectionResults.innerHTML = state.selected3
    .map(
      (value) => `
        <article class="reflection-result">
          <h4>${escapeHtml(value)}</h4>

          ${questions
            .map(
              (question, index) => `
                <div class="reflection-question">
                  <strong>${index + 1}. ${escapeHtml(question)}</strong>
                  <p>${escapeHtml(state.reflections[value][index])}</p>
                </div>
              `
            )
            .join("")}
        </article>
      `
    )
    .join("");

  const alignment = document.querySelector(
    'input[name="alignment"]:checked'
  ).value;

  const reason = document.getElementById("alignmentReason").value.trim();

  alignmentResult.innerHTML = `
    <span class="alignment-answer">
      ${escapeHtml(alignment)}
    </span>

    <p>${escapeHtml(reason)}</p>
  `;

  form.hidden = true;
  resultSection.hidden = false;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

document.getElementById("continueTo5").addEventListener("click", () => {
  if (!validateName()) {
    nameInput.focus();
    return;
  }

  if (state.selected10.length !== 10) {
    showMessage(
      step1Message,
      "Escolha exatamente 10 valores para continuar."
    );
    return;
  }

  renderSelectionGrid(selected10Grid, state.selected10, "five");

  state.selected5 = [];
  updateCounter(selected5Count, 0);

  showStep(step2);
});

document.getElementById("backTo10").addEventListener("click", () => {
  showStep(step1);
});

document.getElementById("continueTo3").addEventListener("click", () => {
  if (state.selected5.length !== 5) {
    showMessage(
      step2Message,
      "Escolha exatamente 5 valores para continuar."
    );
    return;
  }

  renderSelectionGrid(selected5Grid, state.selected5, "three");

  state.selected3 = [];
  updateCounter(selected3Count, 0);

  showStep(step3);
});

document.getElementById("backTo5").addEventListener("click", () => {
  showStep(step2);
});

document
  .getElementById("continueToReflection")
  .addEventListener("click", () => {
    if (state.selected3.length !== 3) {
      showMessage(
        step3Message,
        "Escolha exatamente 3 valores para continuar."
      );
      return;
    }

    renderReflections();
    showStep(step4);
  });

document.getElementById("backTo3").addEventListener("click", () => {
  showStep(step3);
});

document
  .getElementById("continueToIntegration")
  .addEventListener("click", () => {
    if (!validateReflections()) {
      return;
    }

    showStep(step5);
  });

document.getElementById("backToReflection").addEventListener("click", () => {
  showStep(step4);
});

document.getElementById("showResult").addEventListener("click", () => {
  if (!validateIntegration()) {
    return;
  }

  showResult();
});

addOtherButton.addEventListener("click", addOtherValue);

otherValue.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addOtherValue();
  }
});

nameInput.addEventListener("input", validateName);

document.getElementById("printButton").addEventListener("click", () => {
  window.print();
});

document.getElementById("restartButton").addEventListener("click", () => {
  window.location.reload();
});

renderValues();
