import multer from 'multer';

const storage=multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) // IE9 is used to generate a unique suffix for the filename
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
});

const upload = multer({storage,});

export default upload;  