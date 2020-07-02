router.get('/validatereport',loggedInOnly ,async (req, res)=>{
    res.render('valreport')
 
 })
 
 router.post('/validatereport', loggedInOnly , async (req, res)=>{
     var reportNum = req.body.reportNum;
     var status = req.body.status
 
     await blockQuery.validateReports(reportNum , status)
     await console.log("Success")
     await res.redirect("/")
 
 })
 
 router.post('/changeowner',loggedInOnly,  async (req, res)=>{
     var key = req.body.key;
     var buyer = req.body.buyer
     var result = await blockQuery.query_all_car();
     console.log(result)
     if (result == "No Data") {
         res.send("No Data Key")
     } else {
         
         await blockQuery.changeCars(key , buyer)
         await console.log("Success")
         await res.render("Sucess input data in BlockCh")
     }
 
     
 
 })