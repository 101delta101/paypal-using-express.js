const express=require('express');
const paypal=require('paypal-rest-sdk');

paypal.configure({
    'mode':'sandbox',
    'client_id':'AQR-CXAgfbw_Nkaz638BfjuY8Vm75dtJbi2NA1-KJ-dzl6y-M_uc0mzxd6y3NIjgA3MG0ZNI2ChnxQ0M',
    'client_secret':'EHZ4mbHPr-HLK8clPKbrOuXCPqtH7p3JPIgyVOxy_mOn-u573Qx16ewNXB3pufs16D95FN5FYrXTUKpx'
});


const PORT=process.env.PORT||3000
const app=express();

app.get('/',(req,res)=>res.sendFile(__dirname+"/index.html"))
 
app.post('/pay',(req,res)=>{
    const create_payment_json={
        "intent":"sale",
        "payer":{"payment_method":"paypal"
    },
    "redirect_urls":{
        "return_url":"http://localhost:3000/success",
        "cancel_url":"http://localhost:3000/cancel"
    },
    "transactions":[{
        "item_list":{
            "items":[{
                "name":"red sox hat",
                "sku":"001",
                "price":"25.00",
                "currency":"USD",
                "quantity":1
            }]
        },
        "amount":{
            "currency":"USD",
            "total":"25.00"
        },
        "description":"hat for the best team ever"
    }]
    };

    paypal.payment.create(create_payment_json,function(error,payment){
        if(error){
            throw error;}
            else{
                for(let i=0;i<payment.links.length;i++){
                    if(payment.links[i].rel==='approval_url'){
                        res.redirect(payment.links[i].href);
                    }
                }
        }
    });
});


app.get('/success',(req,res)=>{
    const payerId=req.query.PayerID;
    const paymentId=req.query.paymentId;

    const execute_payment_json={
        "payer_id":payerId,
        "transactions":[{
            "amount":{
                "currency":"USD",
                "total":"25.00"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function(error, payment) {
        if (error) {
            console.error(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Success');
        }
    });    
});

app.get("/cancel",(req,res)=>res.send("Cancelled"));
app.listen(PORT,()=>console.log(`server started on ${PORT}`))