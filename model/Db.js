const mysql=require('mysql');
const con=mysql.createConnection({
      host:'localhost',
      port:'3307',
      user:'root',
      password:'root',
      database:'emsdb'
});

// con.connect(function(err){
//   if(err) throw err;
//   else  console.log("connected");
// })
module.exports=con;
