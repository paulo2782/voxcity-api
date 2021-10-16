
var AWS = require('aws-sdk');
const sharp = require('sharp');

var express = require('express');
var router  = express.Router();
const app   = express();

const multer   = require('multer');
// const multerS3 = require('multer-s3-transform');
var multerS3 = require('multer-s3-with-transforms')

var mysql   = require('mysql');
var db      = require('./db.js')
con = mysql.createConnection(db)

// UPLOAD PARA BUCKET VOXCITY-ERP S3
var s3 = new AWS.S3({
    apiVersion:       '2006-03-01',
    region:           'us-east-2',
    accessKeyId:      'AKIAVVQ6RYE5QGAW5EYE',
    secretAccessKey:  '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'
  });
  
// var upload = multer({

//     storage: multerS3({
//         s3: s3,
//         bucket: 'voxcity-erp',
//         contentType: multerS3.AUTO_CONTENT_TYPE,
//         acl: 'public-read',
//         metadata: function(req, file, cb) {
//             cb(null, { fieldName: file.fieldname })
//         },
//         key: function(req,file,cb) {
            
//             cb(null, Date.now().toString() + ' - ' + file.originalname)
            
//         }
//     })
// })
var upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'voxcity-erp',
      transforms: () => sharp().resize(200, 200)
      .max()
      .withoutEnlargement()
      .jpeg({
        progressive: true,
        quality: 80
      }),
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname })
    },
    key: function (req, file, cb) {
        cb(null, Date.now().toString() + ' - ' + file.originalname)
    }
    })
})

router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

router.post("/api/salva_nota", upload.single('arquivo_foto'), async(req, res) => 
 {

    user_id        = req.body.user_id;
    observacao     = req.body.observacao
    arquivo_foto   = req.file.originalname
    uploadLocation = req.file.location
    
    var SQL = "INSERT INTO upload (user_id,observacao,arquivo,link) value('"+user_id+"','"+observacao+"','"+arquivo_foto+"','"+uploadLocation+"')"

    con.query(SQL, (err, rows) => {
        if (err) throw err
        res.json([{msg:'Arquivo enviado'}])    
    });
    
    
});
/////



router.post("/api/mostra_notas", (req, res) => {
    var user_id = req.body.user_id
    var data    = req.body.data

    var SQL = "SELECT * FROM upload where created between '"+data+" 00:00:00' and '"+data+" 23:59:59' and user_id = '"+user_id+"' order by created desc "

    con.query(SQL, (err, rows) => {
        if (err) throw err
        
        res.json({dados:rows,data:data})    
    });

})
module.exports = router;
