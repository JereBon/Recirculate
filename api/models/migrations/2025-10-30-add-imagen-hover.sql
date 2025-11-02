-- Migración para agregar columna imagen_hover a la tabla productos
ALTER TABLE productos ADD COLUMN imagen_hover VARCHAR(255);