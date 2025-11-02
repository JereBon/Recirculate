-- Migración para agregar columnas de imagen frontal y trasera
-- Fecha: 2025

-- Agregar columnas para imágenes frontal y trasera
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS imagen_frente_url TEXT,
ADD COLUMN IF NOT EXISTS imagen_espalda_url TEXT;

-- Migrar datos existentes de imagen_url a imagen_frente_url
UPDATE productos 
SET imagen_frente_url = imagen_url 
WHERE imagen_url IS NOT NULL AND imagen_frente_url IS NULL;

-- Comentario: La columna imagen_url se mantiene por compatibilidad pero puede eliminarse en el futuro
-- Si deseas eliminarla, descomenta la siguiente línea:
-- ALTER TABLE productos DROP COLUMN IF EXISTS imagen_url;
