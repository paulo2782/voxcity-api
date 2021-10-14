var AWS = require('aws-sdk');

var express = require('express');
var router  = express.Router();
const app   = express();

const multer   = require('multer');
const multerS3 = require('multer-s3');

var s3 = new AWS.S3({
    apiVersion:       '2006-03-01',
    region:           'us-east-2',
    accessKeyId:      'AKIAVVQ6RYE5QGAW5EYE',
    secretAccessKey:  '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'
  });
  
var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'voxcity-erp',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        metadata: function(req, file, cb) {
            
            cb(null, { fieldName: file.fieldname })
        },
        key: function(req,file,cb) {
            cb(null,Date.now().toString() + ' - ' + file.originalname)
        }
    })
})

router.post("/api/salva_nota", upload.single('arquivo_foto'), (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    res.json([{mensagem:req.file}])
});

module.exports = router;
