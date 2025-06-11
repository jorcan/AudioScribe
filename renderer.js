// Estado de la aplicación
let files = [];
let apiKey = '';

// Elementos del DOM
const dropZone = document.getElementById('dropZone');
const fileList = document.getElementById('fileList');
const filesContainer = document.getElementById('filesContainer');
const selectBtn = document.getElementById('selectBtn');
const processBtn = document.getElementById('processBtn');
const clearBtn = document.getElementById('clearBtn');
const progressSection = document.getElementById('progressSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultsSection = document.getElementById('resultsSection');
const resultsContainer = document.getElementById('resultsContainer');
const newProcessBtn = document.getElementById('newProcessBtn');
const configBtn = document.getElementById('configBtn');
const configModal = document.getElementById('configModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
const loadingOverlay = document.getElementById('loadingOverlay');

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    await loadApiKey();
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    // Drag & Drop
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);

    // Botones principales
    selectBtn.addEventListener('click', selectFiles);
    processBtn.addEventListener('click', processFiles);
    clearBtn.addEventListener('click', clearFiles);
    newProcessBtn.addEventListener('click', startNewProcess);

    // Modal de configuración
    configBtn.addEventListener('click', openConfigModal);
    closeModalBtn.addEventListener('click', closeConfigModal);
    saveApiKeyBtn.addEventListener('click', saveApiKey);

    // Cerrar modal al hacer clic fuera
    configModal.addEventListener('click', (e) => {
        if (e.target === configModal) {
            closeConfigModal();
        }
    });
}

// Funciones de Drag & Drop
function handleDragOver(e) {
    e.preventDefault();
    dropZone.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    dropZone.classList.remove('drag-over');

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
}

// Seleccionar archivos
async function selectFiles() {
    try {
        const selectedFiles = await window.electronAPI.selectFiles();
        if (selectedFiles.length > 0) {
            addFiles(selectedFiles);
        }
    } catch (error) {
        showError('Error al seleccionar archivos: ' + error.message);
    }
}

// Añadir archivos a la lista
function addFiles(newFiles) {
    // Filtrar archivos válidos
    const validExtensions = ['.mp3', '.wav', '.mp4', '.mov', '.avi', '.mkv', '.wmv'];
    const validFiles = newFiles.filter(file => {
        const ext = getFileExtension(file.name || file.path);
        return validExtensions.includes(ext.toLowerCase());
    });

    if (validFiles.length === 0) {
        showError('No se encontraron archivos válidos. Formatos soportados: MP3, WAV, MP4, MOV, AVI, MKV, WMV');
        return;
    }

    // Añadir archivos únicos
    validFiles.forEach(file => {
        const filePath = file.path || file.webkitRelativePath || file.name;
        const exists = files.some(existingFile => existingFile.path === filePath);

        if (!exists) {
            files.push({
                path: filePath,
                name: file.name || getFileName(filePath),
                size: file.size || 0
            });
        }
    });

    updateUI();
}

// Actualizar interfaz
function updateUI() {
    if (files.length > 0) {
        fileList.style.display = 'block';
        renderFileList();
    } else {
        fileList.style.display = 'none';
    }

    hideOtherSections();
}

// Renderizar lista de archivos
function renderFileList() {
    filesContainer.innerHTML = '';

    files.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';

        const fileIcon = getFileIcon(file.name);

        fileItem.innerHTML = `
            <div class="file-info">
                <span class="file-icon">${fileIcon}</span>
                <span class="file-name">${file.name}</span>
            </div>
            <button class="file-remove" onclick="removeFile(${index})">
                🗑️ Eliminar
            </button>
        `;

        filesContainer.appendChild(fileItem);
    });
}

// Eliminar archivo de la lista
function removeFile(index) {
    files.splice(index, 1);
    updateUI();
}

// Limpiar todos los archivos
function clearFiles() {
    files = [];
    updateUI();
}

// Procesar archivos
async function processFiles() {
    if (files.length === 0) {
        showError('No hay archivos para procesar');
        return;
    }

    if (!apiKey) {
        showError('Por favor, configura tu API Key de Google Gemini primero');
        openConfigModal();
        return;
    }

    try {
        // Mostrar sección de progreso
        showProgressSection();

        // Procesar archivos
        const results = await window.electronAPI.processFiles(files, apiKey);

        // Mostrar resultados
        showResults(results);

    } catch (error) {
        hideProgressSection();
        showError('Error durante el procesamiento: ' + error.message);
    }
}

// Mostrar sección de progreso
function showProgressSection() {
    hideOtherSections();
    progressSection.style.display = 'block';

    // Simular progreso (ya que el procesamiento real es asíncrono)
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;

        progressFill.style.width = progress + '%';
        progressText.textContent = `Procesando archivos... ${Math.round(progress)}%`;

        if (progress >= 90) {
            clearInterval(interval);
            progressText.textContent = 'Finalizando transcripciones...';
        }
    }, 500);
}

// Ocultar sección de progreso
function hideProgressSection() {
    progressSection.style.display = 'none';
}

// Mostrar resultados
function showResults(results) {
    hideProgressSection();
    hideOtherSections();

    resultsSection.style.display = 'block';
    resultsContainer.innerHTML = '';

    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${result.success ? 'success' : 'error'}`;

        const icon = result.success ? '✅' : '❌';
        const fileName = getFileName(result.originalFile);

        resultItem.innerHTML = `
            <div class="result-header">
                <span class="result-icon">${icon}</span>
                <span class="result-file">${fileName}</span>
            </div>
            <div class="result-message">
                ${result.success
                ? `Transcripción guardada en: ${getFileName(result.transcriptionFile)}`
                : `Error: ${result.error}`
            }
            </div>
        `;

        resultsContainer.appendChild(resultItem);
    });
}

// Iniciar nuevo proceso
function startNewProcess() {
    files = [];
    hideOtherSections();
    updateUI();
}

// Ocultar otras secciones
function hideOtherSections() {
    progressSection.style.display = 'none';
    resultsSection.style.display = 'none';
}

// Configuración de API Key
function openConfigModal() {
    configModal.style.display = 'flex';
    apiKeyInput.value = apiKey;
    apiKeyInput.focus();
}

function closeConfigModal() {
    configModal.style.display = 'none';
}

async function saveApiKey() {
    const newApiKey = apiKeyInput.value.trim();

    if (!newApiKey) {
        showError('Por favor, ingresa una API Key válida');
        return;
    }

    try {
        await window.electronAPI.saveApiKey(newApiKey);
        apiKey = newApiKey;
        closeConfigModal();
        showSuccess('API Key guardada correctamente');
    } catch (error) {
        showError('Error al guardar la API Key: ' + error.message);
    }
}

async function loadApiKey() {
    try {
        apiKey = await window.electronAPI.loadApiKey();
    } catch (error) {
        console.error('Error loading API Key:', error);
    }
}

// Funciones de utilidad
function getFileExtension(fileName) {
    return fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
}

function getFileName(filePath) {
    return filePath.split(/[\\/]/).pop();
}

function getFileIcon(fileName) {
    const ext = getFileExtension(fileName);
    const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.wmv'];
    const audioExts = ['.mp3', '.wav'];

    if (videoExts.includes(ext)) return '🎬';
    if (audioExts.includes(ext)) return '🎵';
    return '📄';
}

function showError(message) {
    // Crear notificación de error
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 3000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span>❌</span>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; border: none; color: white; cursor: pointer; margin-left: auto; font-size: 1.2rem;">
                &times;
            </button>
        </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function showSuccess(message) {
    // Crear notificación de éxito
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 3000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span>✅</span>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; border: none; color: white; cursor: pointer; margin-left: auto; font-size: 1.2rem;">
                &times;
            </button>
        </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove después de 3 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Añadir estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
