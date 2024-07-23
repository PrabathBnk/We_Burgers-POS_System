document.getElementById("searchbar").addEventListener("keypress", function(event){
setTimeout(() => {
    let search = [];
    let searchField = document.getElementById("searchbar").value;

    if(isEmpty(searchField)){
        viewAllCustomers();
        return;
    }

    for(let i = 0; i < searchField.length; i++){
       search.push(searchField[i].toLowerCase());
    }
   
    let resultArray = [];
    for (let i = 0; i < search.length; i++) {
       if(i == 0){
           customerList.forEach(element => {
               if((search[0] == element.customerID[0].toLowerCase()) || (search[0] == element.name[0].toLowerCase())){
                   resultArray.push(element);
               }
           });
       }else if(resultArray.length != 0){
           let tempArray = [];

            if((resultArray[0].name.length >= search.length) && (resultArray[0].customerID.length >= search.length)){
                resultArray.forEach(element => {
                       if((search[i] == element.name[i].toLowerCase()) || (search[i] == element.customerID[i].toLowerCase())){
                           tempArray.push(element);
                       }
                   });

            }else if(resultArray[0].name.length >= search.length){
                resultArray.forEach(element => {
                    if((search[i] == element.name[i].toLowerCase())){
                        tempArray.push(element);
                    }
                });

            }else if(resultArray[0].customerID.length >= search.length){
                resultArray.forEach(element => {
                    if((search[i] == element.customerID[i].toLowerCase())){
                        tempArray.push(element);
                    }
                });
            }

           resultArray = tempArray;
       }
   }

   let resultBody = ``;
   for (let i = 0; i < resultArray.length; i++) {
    resultBody += `<tr>
                    <td>${i+1}</td>
                    <td>${resultArray[i].customerID}</td>
                    <td>${resultArray[i].name}</td>
                    <td>${resultArray[i].address}</td>
                    <td><a class="items-link" onclick="toOrders(event)">${calcTotPurchases(resultArray[i].customerID)}</a></td>
                </tr>`
    };

   document.getElementById("viewTblBody").innerHTML = resultArray[0] == "" ?  ``: resultBody;
}, 5);
});

document.getElementById("searchbar").addEventListener("keydown", function(event){
    if(event.key == "Backspace"){
        document.getElementById("searchbar").dispatchEvent(new Event("keypress"));
    }
});


calcTotPurchases = (customerID)=>{
    let totPurchases = 0;
    orders.forEach(element => {
        if(element.customerID == customerID){
            totPurchases += parseFloat(element.netAmount);
        }
    });

    return totPurchases;
}

toOrders = (event)=>{
    if(parseFloat(event.target.innerHTML) > 0){
        let customerID = event.target.parentElement.parentElement.children[1].innerHTML;
        localStorage.setItem("customerID", customerID);
        location.href = "order_details/index.html";
    }
}


