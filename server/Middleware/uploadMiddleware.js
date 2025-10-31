const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.join(__dirname, '../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
    console.log("FS_INFO: Directorio 'uploads' creado en el middleware.");
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
    fileFilter: (req, file, cb) => {
        // *** Mantenemos los logs de depuración, son muy útiles ***
        console.log("--- DEBUG MULTER FILE FILTER ---");
        console.log("File originalname:", file.originalname);
        console.log("File mimetype (reported by browser/system):", file.mimetype);
        console.log("File extension (extracted by path.extname):", path.extname(file.originalname).toLowerCase());
        console.log("---------------------------------");

        const allowedMimes = new RegExp(
            `image\\/(jpeg|png|gif)|` +
            `application\\/(pdf|msword|vnd\\.openxmlformats-officedocument\\.wordprocessingml\\.document|vnd\\.openxmlformats-officedocument\\.spreadsheetml\\.sheet|vnd\\.openxmlformats-officedocument\\.presentationml\\.presentation|` +
            `zip|x-zip-compressed|` + 
            `vnd\\.rar|x-rar-compressed)|` +
            `audio\\/(mpeg|mp3|wav|ogg)|` +
            `video\\/(mp4|mpeg|quicktime|x-msvideo|webm|ogg|x-flv|x-matroska)`
        );

        const allowedExtensions = /\.(jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|mp3|wav|ogg|mp4|mpeg|mpg|mov|avi|wmv|flv|webm|mkv|zip|rar)$/i;

        const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedMimes.test(file.mimetype);

        if (mimetype && extname) {
            console.log("DEBUG: Archivo PERMITIDO por fileFilter");
            return cb(null, true);
        } else {
            console.warn("DEBUG: Archivo NO PERMITIDO por fileFilter. Motivo: Mimetype check:", mimetype, "Extname check:", extname);
            cb('Error: Tipo de archivo no permitido. Solo imágenes (jpeg, png, gif), PDF, Word (doc, docx), Excel (xls, xlsx), PowerPoint (ppt, pptx), Audio (mp3, wav, ogg), Video (mp4, mpeg, mpg, mov, avi, wmv, flv, webm, mkv), ZIP (zip) o RAR (rar).');
        }
    }
});

module.exports = {
    upload,
    UPLOADS_DIR,
    MulterError: multer.MulterError
};