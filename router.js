var AWS = require('aws-sdk');

var express = require('express');
var router  = express.Router();
const app   = express();

const multer   = require('multer');
const multerS3 = require('multer-s3');

var s3 = new AWS.S3({
    apiVersion:       '2006-03-01',
    region:           'sa-east-1',
    accessKeyId:      'AKIA2N5VAMRJMRIEWOFD',
    secretAccessKey:  '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'
  });
  
var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'voxcity',
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
