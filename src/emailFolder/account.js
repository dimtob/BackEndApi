const sgMail=require("@sendgrid/mail")

//const gridApi="S"

sgMail.setApiKey(process.env.SEND_GRID_API_KEY)

var myEmails={}


myEmails.welcomeEmail=function(email,name){
  sgMail.send({
    to: email,
    from: 'dimtobdev@gmail.com',
    subject: 'HEY! WELCOME TO OUR NEW APP '+name,
    text: 'hey m8',
    //html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  });
}

myEmails.byebeymail=function(email,name){
  sgMail.send({
    to: email,
    from: 'dimtobdev@gmail.com',
    subject: 'HEY! VERY SAD TO LOOSE YOU '+name,
    text: 'hey m8',
    //html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  });
}

module.exports=myEmails

                