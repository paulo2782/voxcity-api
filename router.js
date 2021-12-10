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
                id: 'resized',
                key: function (req, file, cb) {
                    cb(null, Date.now().toString() + '-' + file.originalname);
                },
                transform: function (req, file, cb) {
                    cb(null, sharp().resize(640, 840, 
                        {fit: sharp.fit.inside,
                        withoutEnlargement: true}).jpeg())
                },
            }
        ],
        contentType: multerS3.AUTO_CONTENT_TYPE
    })
});

router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

router.post("/api/salva_nota", upload.single('arquivo_foto'), (req, res) => 
{
   
    user_id        = req.body.user_id;
    observacao     = req.body.observacao;
    despesa        = req.body.despesa;
    valor          = req.body.valor;
    arquivo_foto   = req.file.originalname;
    uploadLocation = req.file.transforms[0].location;
    status         = 0;
    
    var SQL = "INSERT INTO upload (user_id,observacao,despesa,valor,arquivo,link,status) value('"+user_id+"','"+observacao+"','"+despesa+"','"+valor+"','"+arquivo_foto+"','"+uploadLocation+"','"+status+"')"
    

    con.query(SQL, (err, rows) => {
        if (err) throw err
        res.json([{msg:'Arquivo enviado'}])    
    });
     
});

/////


router.get("/", (req, res) => {
    res.json({msg:'top'});
})

router.get("/api/mostra_notas_erp", (req, res) => {
    var data_inicio = req.query.data_inicio
    var data_fim    = req.query.data_fim
    var user_id     = req.query.user_id
    var status      = req.query.status
    var tipo_despesa= req.query.tipo_despesa


    if(tipo_despesa == 99){
        
        if( user_id == 0 && status == 99){
            var SQL = "select users.name as nome_colaborador,upload.* from upload INNER JOIN users ON upload.user_id = users.id where upload.created between '"+data_inicio+" 00:00:00' and '"+data_fim+" 23:59:59' "
        }
        if( user_id != 0 && status == 99){
            var SQL = "select users.name as nome_colaborador,upload.* from upload INNER JOIN users ON upload.user_id = users.id where upload.created between '"+data_inicio+" 00:00:00' and '"+data_fim+" 23:59:59' and user_id = '"+user_id+"' "
        }
        if( user_id == 0 && status != 99){
            var SQL = "select users.name as nome_colaborador,upload.* from upload INNER JOIN users ON upload.user_id = users.id where upload.created between '"+data_inicio+" 00:00:00' and '"+data_fim+" 23:59:59' and status = '"+status+"' "
        }
        if( user_id != 0 && status != 99){
            var SQL = "select users.name as nome_colaborador,upload.* from upload INNER JOIN users ON upload.user_id = users.id where upload.created between '"+data_inicio+" 00:00:00' and '"+data_fim+" 23:59:59' and user_id = '"+user_id+"' and status = '"+status+"' "
        }

    }else{

        if( user_id == 0 && status == 99){
            var SQL = "select users.name as nome_colaborador,upload.* from upload INNER JOIN users ON upload.user_id = users.id where upload.created between '"+data_inicio+" 00:00:00' and '"+data_fim+" 23:59:59' "
            +"and despesa = '"+tipo_despesa+"' "
        }
        if( user_id != 0 && status == 99){
            var SQL = "select users.name as nome_colaborador,upload.* from upload INNER JOIN users ON upload.user_id = users.id where upload.created between '"+data_inicio+" 00:00:00' and '"+data_fim+" 23:59:59' and user_id = '"+user_id+"' "
            "and despesa = '"+tipo_despesa+"' "
        }
        if( user_id == 0 && status != 99){
            var SQL = "select users.name as nome_colaborador,upload.* from upload INNER JOIN users ON upload.user_id = users.id where upload.created between '"+data_inicio+" 00:00:00' and '"+data_fim+" 23:59:59' and status = '"+status+"' "
            +"and despesa = '"+tipo_despesa+"'"        
        }
        if( user_id != 0 && status != 99){
            var SQL = "select users.name as nome_colaborador,upload.* from upload INNER JOIN users ON upload.user_id = users.id where upload.created between '"+data_inicio+" 00:00:00' and '"+data_fim+" 23:59:59' and user_id = '"+user_id+"' and status = '"+status+"' "
            +"and despesa = '"+tipo_despesa+"'"        
        }
    }
    con.query(SQL, (err, rows) => {
        if (err) throw err
        res.json({dados:rows})    
    });
});


router.get("/api/situacao_nota_erp", (req, res) => {
    var nota_id = req.query.nota_id
    var SQL = "select * from upload where id = '"+nota_id+"' "        
    
    con.query(SQL, (err, rows) => {
        if (err) throw err
        
        res.json({dados:rows})    
    });

})

router.post("/api/novo_status_nota", (req, res) => {
    var nota_id = req.body.nota_id
    var status  = req.body.status
     
    if(status == '1'){
        var SQL = "UPDATE upload SET status = 1 WHERE id = "+nota_id+""
        con.query(SQL, (err, rows) => {
            if (err) throw err
            res.json({msg:'status da nota alterado'})    
        });

    }
    if(status == '0'){
        var SQL = "UPDATE upload SET status = 0 WHERE id = "+nota_id+""
        con.query(SQL, (err, rows) => {
        if (err) throw err
        res.json({msg:'status da nota alterado'})    
    });

    }


})

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
