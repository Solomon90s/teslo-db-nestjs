import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
    getStaticProductImage( imageName: string) {
        /*
        * Creamos el directorio de donde se encuentra la imagen en el servidor
        * Esto lo podemos usar para cualquier tipo de archivo.
        * Sólo verificamos el fichero exista
        */
        const path = join( __dirname, '../../static/products/', imageName);
        if ( !existsSync(path) )
            throw new BadRequestException(`No product found with image ${ imageName }`);
        return path;
    }
}
