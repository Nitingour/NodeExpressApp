const express=require('express');
const mysql=require('mysql');
const app=express();
const con=require('./model/Db');

const session=require('express-session');

app.listen(3000,()=>{
  console.log("Server started....");
});
//To serv static content
app.use(session({secret:"1234567"}))
app.use(express.static('public'));


//congigure view engine :Hbs
// var path=require('path');
// app.set('views',path.join(__dirname,'views')); //location
// app.set('view engine','hbs');//extension

var hbs= require('express-handlebars');
app.engine( 'hbs', hbs( {
  extname: 'hbs',
  defaultLayout: 'mainLayout',
  layoutsDir: __dirname + '/views/layouts/'
} ) );
 app.set('view engine','hbs');//extension for other vies



// caching disabled for every route
app.use(function(req, res, next) {
res.set('Cache-Control', 'no-cache, private, no-store,must-revalidate,max-stale=0, post-check=0, pre-check=0');
  next();
});

//configure body parser
const bodyParser=require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended:true
}));

app.get('/',(request,response)=>{
response.render('index');
});


app.get('/DeleteEmp',(request,response)=>{
var eid=request.query.empid;
var sql="delete from employee where eid="+eid;
con.query(sql,(err)=>{
  if(err) throw err;
  else{
    var sql="select * from employee";
    con.query(sql,(err,result)=>{
      if(err) throw err;
      else
      response.render('viewemps',{data:result,msg:"Data Deleted"}); //1) extention 2) location
    });

}
});});





app.get('/home',(request,response)=>{
  response.render('home',{user:request.session.user});
});

app.get('/createemp',(request,response)=>{
response.render('newemp',{user:request.session.user}); //1) extention 2) location
});


app.get('/viewallemp',(request,response)=>{
if(request.session.user)
{
var sql="select * from employee";
con.query(sql,(err,result)=>{
  if(err) throw err;
  else
  response.render('viewemps',{data:result,res:response}); //1) extention 2) location
});
}else {
  response.render('index');
}
});


var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'demoapitesing@gmail.com',
    pass: 'xuvKxYB3j2'
  }
});
//https://github.com/Nitingour/NodeExpressApp.git

app.post('/EmpInsert',(request,response)=>{
var eid=request.body.eid;
var ename=request.body.ename;
var salary=request.body.salary;
var address=request.body.address;
var email=request.body.emailid;
var sql="insert into employee values(?,?,?,?,?,?)";

var pwd= Math.random().toString(36).slice(-8);

var input=[eid,ename,salary,address,email,pwd];
sql=mysql.format(sql,input);
con.query(sql,(err)=>{
  if(err) throw err;
  else
  {
    var mailOptions = {
      from: 'demoapitesing@gmail.com',
      to: email,
      subject: 'EMS Account Details',
      text: 'Hello '+ename+", your EMPID="+eid+" and password="+pwd
    };

    transporter.sendMail(mailOptions, function(err, info){
      if (err)  throw err;
        console.log('Email sent: ' + info.response);
        response.render('newemp',{msg:'Data Inserted,and mail sent'});
    });
}


})
});

app.get('/ShowEmp',(request,response)=>{
var eid=request.query.empid;
var sql="select * from employee where eid="+eid;
con.query(sql,(err,result)=>{
  if(err) throw err;
  else
    response.render('showemp',{emp:result});
});
});

app.post('/EmpUpdate',(request,response)=>{
var eid=request.body.eid;
var ename=request.body.ename;
var salary=request.body.salary;
var address=request.body.address;
var sql="update employee set ename=?,salary=?,address=? where eid=?";
var input=[ename,salary,address,eid];
sql=mysql.format(sql,input);
con.query(sql,(err)=>{
  if(err) throw err;
  else{
    var sql="select * from employee";
    con.query(sql,(err,result)=>{
      if(err) throw err;
      else
      response.render('viewemps',{data:result,msg:"Data Updated"}); //1) extention 2) location
    });
}

})
});




app.post('/LoginCheck',(request,response)=>{
      var userid=request.body.uid;
      var pass=request.body.pwd;
var sql="select * from login where uid=? and password=?";
var inputs=[userid,pass];
sql=mysql.format(sql,inputs);
con.query(sql,(err,result)=>{
    if(err) throw err;
    else if(result.length>0){
    request.session.user=userid;
    response.render('home',{user:request.session.user});
  }else
   response.render('index',{msg:'Login Fail'});
     });
});

app.get('/logout',(request,response)=>{
request.session.destroy();
response.render('index');
});


app.use(function(req, res) {
 res.status(404);
res.render('404', {title: '404: Requested Page Not Found'});
});
