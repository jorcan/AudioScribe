#!/bin/bash
cd "$(dirname "$0")"
echo "Iniciando AudioScribe..."
echo "FFmpeg disponible:"
which ffmpeg || echo "FFmpeg no encontrado - la funcionalidad de video estará limitada"
echo ""
echo "Iniciando aplicación..."
./node_modules/.bin/electron . --no-sandbox
