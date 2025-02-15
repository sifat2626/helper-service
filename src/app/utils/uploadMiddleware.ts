import multer from 'multer'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {fileSize: 1024*1024*1024},
  fileFilter: (req, file, cb) => {
    if(file.mimetype.startsWith("image/")||file.mimetype === 'application/pdf'||file.mimetype === 'text/csv'){
      cb(null, true);
    }else{
      cb(new Error('Invalid file type'))
    }
  }
})

export const uploadMiddleware = upload.single('file');
export const uploadMultipleMiddleware = upload.fields([
  {name:'image',maxCount:1},
  {name:'pdf',maxCount:1},
])