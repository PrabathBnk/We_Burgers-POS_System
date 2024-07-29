document.getElementById("searchbar").addEventListener("keypress", function(event){
    setTimeout(() => {
        let search = [];
        let searchField = document.getElementById("searchbar").value;
    
        if(isEmpty(searchField)){
            viewAllOrders();
            return;
        }
    
        for(let i = 0; i < searchField.length; i++){
           search.push(searchField[i].toLowerCase());
        }
        
        let resultArray = [];
        for (let i = 0; i < search.length; i++) {
            
           if(i == 0){
               orders.forEach(element => {
                   if((search[0] == element.orderID[0].toLowerCase()) || (search[0] == element.customerID[0].toLowerCase())){
                       resultArray.push(element);
                   }
               });
           }else if(resultArray.length != 0){
               let tempArray = [];
    
                if(5 >= search.length && search[0].toLowerCase() == "o"){
                    resultArray.forEach(element => {
                        if(search[i] == element.orderID[i].toLowerCase()){
                            tempArray.push(element);
                        }
                    });
                }else if(10 >= search.length){
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
                            <td>${resultArray[i].orderID}</td>
                            <td>${resultArray[i].customerID}</td>
                            <td>${parseFloat(resultArray[i].netAmount).toFixed(2)}</td>
                            <td>${isEmpty(resultArray[i].discount) || parseFloat(resultArray[i].discount) == 0 ? "-": resultArray[i].discount}</td>
                            <td>${resultArray[i].date}</td>
                            <td>${resultArray[i].time}</td>
                            <td><a class="items-link" onclick="toItemDetails(event)">View Details</a></td>
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
 

toItemDetails = (event)=>{
    
    let orderID = event.target.parentElement.parentElement.children[1].innerHTML;
    let order;
    orders.forEach(element => {
        if(orderID == element.orderID){
            order = element;
        }
    });
    localStorage.setItem("result", JSON.stringify(order));

    location.href="/We_Burgers-POS_System/orders/view_order/item_details/index.html";
}
