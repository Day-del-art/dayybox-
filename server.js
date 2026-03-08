const express=require('express');
const multer=require('multer');
const fs=require('fs');
const path=require('path');

const app=express();
const PORT=process.env.PORT||3000;
const API_KEY=process.env.API_KEY||'dayy_super_secret_key';
const APP_NAME=process.env.APP_NAME||'DayyBox Railway';
const uploadsDir=path.join(__dirname,'uploads');
const indexPath=path.join(__dirname,'index.html');

if(!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir,{recursive:true});

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/uploads', express.static(uploadsDir));

function sendJson(res,code,data){return res.status(code).json(data)}
function getBaseUrl(req){return `${req.protocol}://${req.get('host')}`}
function checkAuth(req){return (req.headers.authorization||'')===`Bearer ${API_KEY}`}

const storage=multer.diskStorage({
  destination:(_req,_file,cb)=>cb(null,uploadsDir),
  filename:(_req,file,cb)=>{
    const safe=String(file.originalname||`file-${Date.now()}`).replace(/[^a-zA-Z0-9._-]/g,'-').replace(/-+/g,'-');
    cb(null,`${Date.now()}-${safe}`);
  }
});
const upload=multer({storage,limits:{fileSize:100*1024*1024}});

app.get('/',(_req,res)=>res.sendFile(indexPath));

app.get('/api/health',(req,res)=>sendJson(res,200,{
  success:true,app:APP_NAME,message:'api hidup',method:'GET',apiKeyDefault:API_KEY,baseUrl:getBaseUrl(req),
  endpoints:{
    home:'GET /',
    health:'GET /api/health',
    uploadInfo:'GET /api/upload',
    upload:'POST /api/upload',
    list:'GET /api/list',
    delete:'DELETE /api/delete?filename=...'
  },
  timestamp:new Date().toISOString()
}));

app.get('/api/upload',(_req,res)=>sendJson(res,200,{
  success:true,
  message:'ini endpoint upload. pakai method POST, bukan GET.',
  method_required:'POST',
  headers_required:{Authorization:'Bearer <API_KEY>'},
  form_data_required:{file:'binary file'},
  example_curl:'curl -X POST "https://domain-lu/api/upload" -H "Authorization: Bearer dayy_super_secret_key" -F "file=@/path/file.jpg"'
}));

app.post('/api/upload',(req,res)=>{
  if(!checkAuth(req)) return sendJson(res,401,{success:false,message:'Unauthorized'});
  upload.single('file')(req,res,(err)=>{
    if(err) return sendJson(res,500,{success:false,message:'Upload failed',error:String(err.message||err)});
    if(!req.file) return sendJson(res,400,{success:false,message:'No file uploaded. Pakai form-data key: file'});
    const url=`${getBaseUrl(req)}/uploads/${encodeURIComponent(req.file.filename)}`;
    return sendJson(res,200,{success:true,filename:req.file.filename,originalname:req.file.originalname,type:req.file.mimetype,size:req.file.size,url});
  });
});

app.get('/api/list',(req,res)=>{
  if(!checkAuth(req)) return sendJson(res,401,{success:false,message:'Unauthorized'});
  try{
    const items=fs.readdirSync(uploadsDir).map(name=>{
      const full=path.join(uploadsDir,name); const stat=fs.statSync(full);
      return {filename:name,size:stat.size,createdAt:stat.birthtime,url:`${getBaseUrl(req)}/uploads/${encodeURIComponent(name)}`};
    });
    return sendJson(res,200,{success:true,message:'Daftar file berhasil diambil',count:items.length,files:items});
  }catch(e){return sendJson(res,500,{success:false,message:'Gagal ambil daftar file',error:String(e.message||e)})}
});

app.delete('/api/delete',(req,res)=>{
  if(!checkAuth(req)) return sendJson(res,401,{success:false,message:'Unauthorized'});
  const filename=String((req.query&&req.query.filename)||'');
  if(!filename) return sendJson(res,400,{success:false,message:'filename wajib diisi di query'});
  const full=path.join(uploadsDir,path.basename(filename));
  if(!fs.existsSync(full)) return sendJson(res,404,{success:false,message:'File tidak ditemukan'});
  try{fs.unlinkSync(full); return sendJson(res,200,{success:true,filename,message:'File berhasil dihapus'})}
  catch(e){return sendJson(res,500,{success:false,message:'Gagal hapus file',error:String(e.message||e)})}
});

app.listen(PORT,'0.0.0.0',()=>console.log(`${APP_NAME} running on 0.0.0.0:${PORT}`));
