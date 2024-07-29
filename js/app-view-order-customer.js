document.getElementById("searchbar").addEventListener("keypress", function(event){
    let orders = JSON.parse(localStorage.getItem("orders"));
    setTimeout(() => {
        let search = [];
        let searchField = document.getElementById("searchbar").value;
    
        if(isEmpty(searchField)){
            viewAllOrders(orders);
            return;
        }
    
        for(let i = 0; i < searchField.length; i++){
           search.push(searchField[i].toLowerCase());
        }
        
        let resultArray = [];
        for (let i = 0; i < search.length; i++) {
            
           if(i == 0){
               orders.forEach(element => {
                   if((search[0] == element.orderID[0].toLowerCase())){
                       resultArray.push(element);
                   }
               });
           }else if(resultArray.length != 0 && 5 >= search.length){
               let tempArray = [];
    
                resultArray.forEach(element => {
                    if(search[i] == element.orderID[i].toLowerCase()){
                        tempArray.push(element);
                    }
                });
                
               resultArray = tempArray;
           }
       }
    
       let resultBody = ``;
       for (let i = 0; i < resultArray.length; i++) {
        resultBody += `<tr>
                            <td>${i+1}</td>
                            <td>${resultArray[i].orderID}</td>
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

    location.href="/We_Burgers-POS_System/cutomers/view_customer/orders/item_details/index.html";
}


viewCustomerOrders = ()=>{
    getOrders();
    setTimeout(() => {
        let customerID = localStorage.getItem("customerID");
        document.getElementById("customerID").innerHTML = customerID;
        let customerOrders = [];

        orders.forEach(element => {
            if(element.customerID == customerID){
                customerOrders.push(element);
            }
        });
        localStorage.setItem("orders", JSON.stringify(customerOrders))
        viewAllOrders(customerOrders);
    }, 10);
}

viewAllOrders = (orders)=>{
    let tblBody = ``;
    for (let i = 0; i < orders.length; i++) {
        tblBody += `<tr>
                        <td>${i+1}</td>
                        <td>${orders[i].orderID}</td>
                        <td>${parseFloat(orders[i].netAmount).toFixed(2)}</td>
                        <td>${isEmpty(orders[i].discount) || parseFloat(orders[i].discount) == 0 ? "-": orders[i].discount}</td>
                        <td>${orders[i].date}</td>
                        <td>${orders[i].time}</td>
                        <td><a class="items-link" onclick="toItemDetails(event)">View Details</a></td>
                    </tr>`
    }

    document.getElementById("viewTblBody").innerHTML = tblBody;
}

backToViewCustomer = ()=>{
    localStorage.clear();
    location.href = "/We_Burgers-POS_System/customers/view_customer/index.html";
}