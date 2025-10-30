-- Corrige el constraint de género para productos
ALTER TABLE productos
DROP CONSTRAINT IF EXISTS productos_genero_check;

ALTER TABLE productos
ADD CONSTRAINT productos_genero_check
CHECK (genero IN ('hombre', 'mujer', 'unisex'));
