// WhatsApp oficial da barbearia, com DDD e sem símbolos.
const WHATSAPP_BARBEARIA = '5521992997872';
const INSTAGRAM_BARBEARIA = 'barbeariadovarella';

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('active');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const telefoneInput = document.getElementById('telefone');
if (telefoneInput) {
  telefoneInput.addEventListener('input', () => {
    telefoneInput.value = telefoneInput.value.replace(/\D/g, '').slice(0, 11);
  });
  telefoneInput.addEventListener('paste', (e) => {
    e.preventDefault();
    const texto = (e.clipboardData || window.clipboardData).getData('text');
    telefoneInput.value = texto.replace(/\D/g, '').slice(0, 11);
  });
}

const form = document.getElementById('bookingForm');
const wizardSteps = Array.from(document.querySelectorAll('.wizard-step'));
const stepDots = Array.from(document.querySelectorAll('.step-dot'));
const progressFill = document.getElementById('progressFill');
const prevStepBtn = document.getElementById('prevStep');
const nextStepBtn = document.getElementById('nextStep');
const wizardActions = document.querySelector('.wizard-actions');
const finalSummary = document.getElementById('finalSummary');
let currentStep = 0;


// Salvamento automático do agendamento no navegador
const BOOKING_STORAGE_KEY = 'barbeariaVarellaAgendamentoRascunho';
let isRestoringBooking = false;

function getBookingDraft() {
  const barbeiro = document.querySelector('input[name="barbeiro"]:checked')?.value || '';
  return {
    nome: document.getElementById('nome')?.value || '',
    telefone: document.getElementById('telefone')?.value || '',
    barbeiro,
    tipo: document.getElementById('tipo')?.value || '',
    servico: document.getElementById('servico')?.value || '',
    data: document.getElementById('data')?.value || '',
    hora: document.getElementById('hora')?.value || '',
    obs: document.getElementById('obs')?.value || '',
    etapaAtual: currentStep || 0,
    salvoEm: new Date().toISOString()
  };
}

function hasUsefulDraft(draft) {
  if (!draft) return false;
  return Boolean(
    draft.nome || draft.telefone || draft.barbeiro || draft.tipo ||
    draft.servico || draft.data || draft.hora || draft.obs
  );
}

function saveBookingDraft() {
  if (!form || isRestoringBooking) return;
  const draft = getBookingDraft();
  if (!hasUsefulDraft(draft)) return;
  localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(draft));
}

function clearBookingDraft() {
  localStorage.removeItem(BOOKING_STORAGE_KEY);
}

function readBookingDraft() {
  try {
    return JSON.parse(localStorage.getItem(BOOKING_STORAGE_KEY));
  } catch (error) {
    clearBookingDraft();
    return null;
  }
}

function setValue(id, value) {
  const field = document.getElementById(id);
  if (field && value !== undefined && value !== null) field.value = value;
}

function applyBookingDraft(draft) {
  if (!draft) return;
  isRestoringBooking = true;
  setValue('nome', draft.nome);
  setValue('telefone', draft.telefone);
  setValue('tipo', draft.tipo);
  setValue('servico', draft.servico);
  setValue('data', draft.data);
  setValue('hora', draft.hora);
  setValue('obs', draft.obs);

  if (draft.barbeiro) {
    const radio = document.querySelector(`input[name="barbeiro"][value="${CSS.escape(draft.barbeiro)}"]`);
    if (radio) radio.checked = true;
  }

  isRestoringBooking = false;
  updateFinalSummary();
  showStep(Number(draft.etapaAtual || 0));
}

function showResumePrompt(draft) {
  const overlay = document.getElementById('resumeOverlay');
  const resumeBtn = document.getElementById('resumeBooking');
  const clearBtn = document.getElementById('clearSavedBooking');
  if (!overlay || !resumeBtn || !clearBtn) return;

  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');

  resumeBtn.onclick = () => {
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
    applyBookingDraft(draft);
  };

  clearBtn.onclick = () => {
    clearBookingDraft();
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
    showStep(0);
  };
}

function initBookingAutosave() {
  const draft = readBookingDraft();
  showStep(0);
  if (hasUsefulDraft(draft)) {
    setTimeout(() => showResumePrompt(draft), 450);
  }
}

function setMinDate() {
  const dataInput = document.getElementById('data');
  if (!dataInput) return;
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  dataInput.min = `${ano}-${mes}-${dia}`;
}
setMinDate();

function formatDateBR(value) {
  if (!value) return '-';
  const [ano, mes, dia] = value.split('-');
  return `${dia}/${mes}/${ano}`;
}

function updateFinalSummary() {
  if (!finalSummary) return;
  const nome = document.getElementById('nome')?.value.trim() || '-';
  const tipo = document.getElementById('tipo')?.value || '-';
  const barbeiro = document.querySelector('input[name="barbeiro"]:checked')?.value || '-';
  const servico = document.getElementById('servico')?.value || '-';
  const data = formatDateBR(document.getElementById('data')?.value);
  const hora = document.getElementById('hora')?.value || '-';
  finalSummary.innerHTML = `
    <div><span>Cliente</span><strong>${nome}</strong></div>
    <div><span>Barbeiro</span><strong>${barbeiro}</strong></div>
    <div><span>Serviço</span><strong>${servico} • ${tipo}</strong></div>
    <div><span>Data e horário</span><strong>${data} às ${hora}</strong></div>
  `;
}

function showStep(index) {
  currentStep = Math.max(0, Math.min(index, wizardSteps.length - 1));
  wizardSteps.forEach((step, i) => step.classList.toggle('active', i === currentStep));
  stepDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentStep);
    dot.classList.toggle('done', i < currentStep);
  });
  if (progressFill) progressFill.style.width = `${(currentStep / (wizardSteps.length - 1)) * 100}%`;
  if (wizardActions) {
    wizardActions.classList.toggle('first', currentStep === 0);
    wizardActions.classList.toggle('final', currentStep === wizardSteps.length - 1);
  }
  updateFinalSummary();
  saveBookingDraft();
}

const customAlert = document.getElementById('customAlert');
const alertTitle = document.getElementById('alertTitle');
const alertMessage = document.getElementById('alertMessage');
const closeAlert = document.getElementById('closeAlert');
let alertTimer;

function showCustomAlert(title, message, field) {
  clearTimeout(alertTimer);
  if (alertTitle) alertTitle.textContent = title;
  if (alertMessage) alertMessage.textContent = message;
  if (customAlert) customAlert.classList.add('show');

  document.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
  if (field) {
    field.classList.add('field-error');
    if (typeof field.focus === 'function') field.focus({ preventScroll: true });
    field.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  alertTimer = setTimeout(() => {
    if (customAlert) customAlert.classList.remove('show');
  }, 4300);
}

if (closeAlert) {
  closeAlert.addEventListener('click', () => {
    if (customAlert) customAlert.classList.remove('show');
  });
}

function getFieldName(field) {
  const label = field.closest('label');
  if (!label) return 'campo obrigatório';
  return (label.childNodes[0]?.textContent || 'campo obrigatório').trim();
}

function validateCurrentStep() {
  const radioGroups = Array.from(new Set(Array.from(wizardSteps[currentStep].querySelectorAll('input[type="radio"][required]')).map(radio => radio.name)));
  for (const groupName of radioGroups) {
    const selected = wizardSteps[currentStep].querySelector(`input[name="${groupName}"]:checked`);
    if (!selected) {
      const group = wizardSteps[currentStep].querySelector('.barber-choice-grid') || wizardSteps[currentStep];
      showCustomAlert('Escolha o barbeiro', 'Selecione um barbeiro ou marque Sem preferência para continuar.', group);
      return false;
    }
  }

  const fields = Array.from(wizardSteps[currentStep].querySelectorAll('input:not([type="radio"]), select, textarea'));
  for (const field of fields) {
    if (field.hasAttribute('required') && !field.value.trim()) {
      showCustomAlert('Falta uma informação', `Preencha o campo: ${getFieldName(field)}.`, field);
      return false;
    }
  }

  const telefoneField = document.getElementById('telefone');
  const telefone = telefoneField?.value.replace(/\D/g, '') || '';
  if (currentStep === 0 && telefone.length < 10) {
    showCustomAlert('WhatsApp inválido', 'Digite somente números com DDD. Ex: 21999999999.', telefoneField);
    return false;
  }

  return true;
}

if (nextStepBtn) {
  nextStepBtn.addEventListener('click', () => {
    if (!validateCurrentStep()) return;
    showStep(currentStep + 1);
  });
}

if (prevStepBtn) {
  prevStepBtn.addEventListener('click', () => showStep(currentStep - 1));
}

stepDots.forEach((dot) => {
  dot.addEventListener('click', () => {
    const target = Number(dot.dataset.step);
    if (target <= currentStep) showStep(target);
  });
});

if (form) {
  initBookingAutosave();
  form.addEventListener('input', (e) => {
    updateFinalSummary();
    saveBookingDraft();
    if (e.target) e.target.classList.remove('field-error');
  });
  form.addEventListener('change', (e) => {
    updateFinalSummary();
    saveBookingDraft();
    if (e.target) e.target.classList.remove('field-error');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    const nome = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value.replace(/\D/g, '').trim();
    const barbeiro = document.querySelector('input[name="barbeiro"]:checked')?.value || 'Sem preferência';
    const tipo = document.getElementById('tipo').value;
    const servico = document.getElementById('servico').value;
    const data = document.getElementById('data').value;
    const hora = document.getElementById('hora').value;
    const obs = document.getElementById('obs').value.trim();

    if (telefone.length < 10) {
      showStep(0);
      showCustomAlert('WhatsApp inválido', 'Digite somente números com DDD. Ex: 21999999999.', document.getElementById('telefone'));
      return;
    }

    const telefoneFormatado = telefone.length === 11
      ? `(${telefone.slice(0,2)}) ${telefone.slice(2,7)}-${telefone.slice(7)}`
      : `(${telefone.slice(0,2)}) ${telefone.slice(2,6)}-${telefone.slice(6)}`;

    const mensagem = `Olá! Quero agendar um horário na Barbearia do Varella.%0A%0A` +
      `Nome: ${nome}%0A` +
      `WhatsApp: ${telefoneFormatado}%0A` +
      `Barbeiro: ${barbeiro}%0A` +
      `Tipo: ${tipo}%0A` +
      `Serviço: ${servico}%0A` +
      `Data: ${formatDateBR(data)}%0A` +
      `Horário: ${hora}%0A` +
      `Aviso: horários em feriados e finais de semana podem ser afetados. Aguardando confirmação da barbearia.%0A` +
      `Observação: ${obs || 'Nenhuma'}`;

    clearBookingDraft();
    window.open(`https://wa.me/${WHATSAPP_BARBEARIA}?text=${mensagem}`, '_blank');
  });
}


// Player de vídeo personalizado
document.querySelectorAll('.custom-video-player').forEach((player) => {
  const video = player.querySelector('.result-video');
  const playButton = player.querySelector('.play-toggle');
  const soundButton = player.querySelector('.sound-toggle');

  if (!video || !playButton || !soundButton) return;

  function updateButtons(){
    playButton.textContent = video.paused ? '▶' : '⏸';
    soundButton.textContent = video.muted ? '🔇' : '🔊';
  }

  playButton.addEventListener('click', (event) => {
    event.stopPropagation();
    if(video.paused){
      video.play().catch(() => {});
    }else{
      video.pause();
    }
    updateButtons();
  });

  soundButton.addEventListener('click', (event) => {
    event.stopPropagation();
    video.muted = !video.muted;
    updateButtons();
  });

  video.addEventListener('click', () => playButton.click());
  video.addEventListener('error', () => player.classList.add('video-error'));
  video.addEventListener('play', updateButtons);
  video.addEventListener('pause', updateButtons);
  video.addEventListener('loadeddata', () => player.classList.remove('video-error'));

  updateButtons();
});


// Notificação fake/elegante de agenda em tempo real
(function liveBookingNotification(){
  const toast = document.getElementById('liveBookingToast');
  if (!toast) return;

  const nomes = ['Lucas', 'Rafael', 'Bruno', 'Matheus', 'Gabriel', 'Thiago', 'Felipe', 'André', 'João', 'Pedro'];
  const servicos = ['Corte Masculino', 'Barba Tradicional', 'Pezinho', 'Sobrancelha', 'Barboterapia', 'Nevou', 'Hidratação'];

  function sortear(lista){
    return lista[Math.floor(Math.random() * lista.length)];
  }

  function mostrar(){
    const nome = sortear(nomes);
    const servico = sortear(servicos);
    toast.innerHTML = `<strong>💈 ${nome} acabou de agendar</strong><span>${servico}</span> • horário reservado há poucos segundos.`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 6500);
  }

  setTimeout(mostrar, 2500);
  setInterval(mostrar, 90000);
})();
