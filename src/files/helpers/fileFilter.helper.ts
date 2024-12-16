export const fileFilter = ( req: Express.Request, file: Express.Multer.File, callback: Function ) => {
    /*
    * Realizamos las validaciones necesarias
    * Si el archivo no existe devolvemos el error
    * El false indica que no ACEPTAMOS EL ARCHIVO
    */
    if( !file ) return callback( new Error('File is empty'), false );

    const fileExtension = file.mimetype.split('/')[1];
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    if ( validExtensions.includes(fileExtension)){
        return callback(null, true);
    }
    callback(null, false);
}