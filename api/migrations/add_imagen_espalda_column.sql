-- Migración: Agregar columna imagen_espalda_url a la tabla productos
-- Fecha: 2025-10-29
-- Propósito: Permitir almacenar URL de imagen de espalda del producto subida via Cloudinary

-- Agregar nueva columna para imagen de espalda
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS imagen_espalda_url TEXT;

-- Agregar comentario para documentación
COMMENT ON COLUMN productos.imagen_espalda_url IS 'URL de la imagen de espalda del producto (Cloudinary)';

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'productos' 
AND column_name = 'imagen_espalda_url';