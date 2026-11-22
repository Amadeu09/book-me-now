import { memoryStorage } from 'multer';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

/**
 * Opcions de Multer per pujar una sola imatge a memòria.
 * `limits` fa que Multer talli la pujada en arribar al màxim, en lloc de carregar
 * a RAM un fitxer de qualsevol mida abans que el validador el rebutgi.
 */
export function opcionsPujadaImatge(maxMb: number): MulterOptions {
  return {
    storage: memoryStorage(),
    limits: {
      fileSize: maxMb * 1024 * 1024,
      files: 1,
      fields: 10,
      parts: 12,
    },
  };
}
