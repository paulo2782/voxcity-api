
var AWS = require('aws-sdk');

var express = require('express');
var router  = express.Router();
const app   = express();

const multer   = require('multer');
var multerS3   = require('multer-s3-transform')
const sharp    = require('sharp');

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
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(new Error(message.FAIL.invalidImage), false);
    }
};

const upload = multer({
    fileFilter,
    storage: multerS3({
        s3,
        bucket: 'voxcity-erp',
        acl: 'public-read',
        shouldTransform: function (req, file, cb) {
            cb(null, true);
        },
        transforms: [
            {
                id: 'original',
                key: function (req, file, cb) {
                    cb(null, Date.now().toString());
                },
                transform: function (req, file, cb) {
                    console.log('og');
                    cb(null, sharp().jpg())
                },
            },
            {
                id: 'resized',
                key: function (req, file, cb) {
                    cb(null, Date.now().toString());
                },
                transform: function (req, file, cb) {
                    console.log('thumbnail');
                    cb(null, sharp().resize(300, 300).jpg())
                },
            }
        ],
        metadata: function (req, file, cb) {
            cb(null, {fieldName: 'some meta'});
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString());
        },
    })
});

router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

router.post("/api/salva_nota", upload.single('arquivo_foto'), (req, res) => 
 {
    console.log('aqui')
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
