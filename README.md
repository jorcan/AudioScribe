# AudioScribe 🎵

Una herramienta minimalista que convierte automáticamente el contenido hablado de tus archivos de video o audio en texto limpio y preciso usando la API de Google Gemini.

## ✨ Características

- **Simplicidad Extrema**: Interfaz drag & drop intuitiva
- **Automatización Total**: Detección automática de formato y extracción de audio
- **Potencia de Gemini**: Transcripciones de alta calidad con IA avanzada
- **Seguro y Personal**: Funciona localmente con tu propia API Key
- **Multiplataforma**: Compatible con Linux, Windows y macOS

## 🎯 Formatos Soportados

### Video
- MP4, MOV, AVI, MKV, WMV

### Audio
- MP3, WAV

## 🚀 Instalación

### Prerrequisitos

1. **Node.js** (versión 16 o superior)
2. **FFmpeg** instalado en tu sistema:
   ```bash
   # Ubuntu/Debian
   sudo apt install ffmpeg
   
   # macOS (con Homebrew)
   brew install ffmpeg
   
   # Windows (con Chocolatey)
   choco install ffmpeg
   ```

3. **API Key de Google Gemini**:
   - Visita [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Crea una nueva API Key
   - Guárdala de forma segura

### Instalación de dependencias

```bash
cd transcriber
npm install
```

## 🎮 Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

### Crear distribución
```bash
npm run build
```

## 📋 Cómo usar AudioScribe

1. **Configurar API Key**:
   - Haz clic en el botón "⚙️ Configurar"
   - Ingresa tu API Key de Google Gemini
   - Guarda la configuración

2. **Añadir archivos**:
   - Arrastra y suelta archivos de video/audio en la zona designada
   - O haz clic en "Seleccionar Archivos" para elegir manualmente

3. **Transcribir**:
   - Haz clic en "🚀 Transcribir Archivos"
   - Espera a que se complete el procesamiento
   - Los archivos de texto se guardarán en la misma carpeta que los originales

## 🛠️ Tecnologías utilizadas

- **Electron**: Framework para aplicaciones de escritorio
- **Node.js**: Runtime de JavaScript
- **FFmpeg**: Procesamiento de multimedia
- **Google Gemini API**: Inteligencia artificial para transcripción
- **HTML/CSS/JavaScript**: Interfaz de usuario moderna

## 📁 Estructura del proyecto

```
transcriber/
├── main.js           # Proceso principal de Electron
├── preload.js        # Script de prelcarga para seguridad
├── index.html        # Interfaz principal
├── styles.css        # Estilos de la aplicación
├── renderer.js       # Lógica del frontend
├── package.json      # Configuración del proyecto
└── assets/           # Recursos de la aplicación
```

## 🔧 Configuración avanzada

### Variables de entorno

Puedes crear un archivo `.env` en la raíz del proyecto para configurar variables:

```env
GEMINI_API_KEY=tu_api_key_aquí
DEFAULT_OUTPUT_FORMAT=txt
```

### Personalización de FFmpeg

La aplicación usa FFmpeg con configuración optimizada para transcripción:
- Frecuencia de muestreo: 16kHz
- Canales: Mono
- Formato: MP3

## 🐛 Solución de problemas

### Error: "FFmpeg no encontrado"
- Asegúrate de que FFmpeg esté instalado y en el PATH del sistema
- En Windows, reinicia la aplicación después de instalar FFmpeg

### Error: "API Key inválida"
- Verifica que tu API Key de Gemini sea correcta
- Asegúrate de que la API esté habilitada en tu cuenta de Google

### Problemas de permisos
- En Linux/macOS, asegúrate de que la aplicación tenga permisos de lectura/escritura
- Ejecuta con `sudo` si es necesario para la instalación

## 📄 Licencia

MIT License - Siéntete libre de usar, modificar y distribuir este proyecto.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue antes de hacer cambios significativos.

## 📞 Soporte

Si encuentras problemas o tienes sugerencias, puedes:
- Abrir un issue en el repositorio
- Revisar la documentación de [Google Gemini API](https://ai.google.dev/docs)
- Consultar la documentación de [Electron](https://www.electronjs.org/docs)

---

**AudioScribe** - Transcripción inteligente simplificada ✨
