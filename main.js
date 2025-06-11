const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs-extra');
let ffmpeg;
try {
  ffmpeg = require('fluent-ffmpeg');
} catch (error) {
  console.log('FFmpeg not available - video processing will be disabled');
}
const { GoogleGenerativeAI } = require('@google/generative-ai');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.svg'),
    titleBarStyle: 'default',
    show: false
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Desarrollo: abrir DevTools
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Función para extraer audio de video
function extractAudio(videoPath, outputPath) {
  return new Promise((resolve, reject) => {
    if (!ffmpeg) {
      reject(new Error('FFmpeg no está disponible. Instala FFmpeg para procesar videos.'));
      return;
    }

    ffmpeg(videoPath)
      .output(outputPath)
      .audioCodec('libmp3lame')
      .audioFrequency(16000)
      .audioChannels(1)
      .on('end', () => {
        resolve(outputPath);
      })
      .on('error', (err) => {
        reject(err);
      })
      .run();
  });
}

// Función para transcribir audio usando Gemini
async function transcribeAudio(audioPath, apiKey) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Leer el archivo de audio
    const audioData = await fs.readFile(audioPath);
    const audioBase64 = audioData.toString('base64');

    const prompt = "Por favor, transcribe el audio siguiente a texto. Proporciona solo la transcripción sin comentarios adicionales:";

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "audio/mp3",
          data: audioBase64
        }
      }
    ]);

    const response = await result.response;
    return response.text();
  } catch (error) {
    throw new Error(`Error en transcripción: ${error.message}`);
  }
}

// Función para procesar archivos
async function processFiles(files, apiKey) {
  const results = [];

  for (const file of files) {
    try {
      const filePath = file.path;
      const fileName = path.parse(filePath).name;
      const fileExt = path.parse(filePath).ext.toLowerCase();
      const outputDir = path.dirname(filePath);

      let audioPath = filePath;
      let tempAudioPath = null;

      // Si es video, extraer audio
      if (['.mp4', '.mov', '.avi', '.mkv', '.wmv'].includes(fileExt)) {
        tempAudioPath = path.join(outputDir, `${fileName}_temp.mp3`);
        audioPath = await extractAudio(filePath, tempAudioPath);
      }

      // Transcribir audio
      const transcription = await transcribeAudio(audioPath, apiKey);

      // Guardar transcripción
      const txtPath = path.join(outputDir, `${fileName}.txt`);
      await fs.writeFile(txtPath, transcription, 'utf8');

      // Limpiar archivo temporal si existe
      if (tempAudioPath && await fs.pathExists(tempAudioPath)) {
        await fs.remove(tempAudioPath);
      }

      results.push({
        success: true,
        originalFile: filePath,
        transcriptionFile: txtPath,
        message: 'Transcripción completada exitosamente'
      });

    } catch (error) {
      results.push({
        success: false,
        originalFile: file.path,
        error: error.message
      });
    }
  }

  return results;
}

// Manejar solicitudes de procesamiento
ipcMain.handle('process-files', async (event, files, apiKey) => {
  if (!apiKey) {
    throw new Error('Se requiere una API Key de Google Gemini');
  }

  return await processFiles(files, apiKey);
});

// Manejar configuración de API Key
ipcMain.handle('save-api-key', async (event, apiKey) => {
  const configPath = path.join(app.getPath('userData'), 'config.json');
  const config = { apiKey };
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  return true;
});

ipcMain.handle('load-api-key', async () => {
  const configPath = path.join(app.getPath('userData'), 'config.json');
  try {
    if (await fs.pathExists(configPath)) {
      const config = await fs.readJSON(configPath);
      return config.apiKey || '';
    }
  } catch (error) {
    console.error('Error loading API key:', error);
  }
  return '';
});

// Manejar selección de archivos
ipcMain.handle('select-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Audio/Video Files', extensions: ['mp3', 'wav', 'mp4', 'mov', 'avi', 'mkv', 'wmv'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled) {
    return result.filePaths.map(filePath => ({
      path: filePath,
      name: path.basename(filePath)
    }));
  }
  return [];
});
