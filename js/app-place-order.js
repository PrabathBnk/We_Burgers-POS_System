onlyNumbers = (event)=>{
    event.target.value = event.target.value.replace(/[a-z]/gi, "");
    setTimeout(()=>{
        calculateTotal();
    }, 10)
}

calculateTotal = ()=>{
    let total = 0;
    orderItemList.forEach(element => {
        total += element.totalAmount;
    });
    
    document.getElementById("total").innerHTML = total; 

    calculateNetTotal(total);
}

calculateNetTotal = (total)=>{
    document.getElementById("netTotal").innerHTML = total - getDiscount();

    document.getElementById("payment").dispatchEvent(new Event("focusout"));
}

getDiscount = ()=>{
    let discount = parseFloat(document.getElementById("orderDiscount").value);
    return isNaN(discount) ? 0: discount; 
}

document.getElementById("payment").addEventListener("focusout", function(){
    let payment = parseFloat(document.getElementById("payment").value);
    let netTotal = parseFloat(document.getElementById("netTotal").innerHTML);
    
    let balance = isNaN(payment) || isNaN(netTotal) ? "" : payment - netTotal;

    document.getElementById("balance").innerHTML = balance;

    setTimeout(()=>{
        enableBtnContinue();
    }, 10)
});

document.getElementById("payment").addEventListener("keydown", function(event){
    if(event.key == "Enter"){
        document.getElementById("payment").dispatchEvent(new Event("focusout"));
    }
})


enableBtnContinue = ()=>{
    let balance = parseFloat(document.getElementById("balance").innerHTML);

    if(!isNaN(balance) && balance >= 0 && orderItemList.length > 0){
        document.getElementById("btnContinue").disabled = false;
    }else{
        document.getElementById("btnContinue").disabled = true;
    }
}

document.getElementById("btnContinue").addEventListener("click", function(){
    let itemDetailsList = [];
    for (let i = 0; i < orderItemList.length; i++) {
        let tr = document.getElementById("orderItems").children[i];
        let item = {
            no: orderItemList[i].no,
            itemCode: orderItemList[i].itemCode,
            name: tr.children[2].innerHTML,
            price: tr.children[3].innerHTML,
            qty: orderItemList[i].qty,
            discount: tr.children[5].innerHTML,
            totalAmount: orderItemList[i].totalAmount
        }
        itemDetailsList.push(item);
    }
    console.log(itemDetailsList);

    if(isInsufficientStock(itemDetailsList)) return;

    getCustomers();
    let customerID = prompt("Enter Customer ID: ")
    if(isValidCustomer(customerID)){
        

        let itemStore = openRequest.result.transaction("item_os", "readwrite").objectStore("item_os");

        itemDetailsList.forEach(element => {
            let getRequest = itemStore.get(element.itemCode);

            getRequest.onsuccess = ()=>{
                let item = getRequest.result;
                item.qty -= element.qty;

                let updateRequest = itemStore.put(item);
                updateRequest.transaction;

                updateRequest.onsuccess = ()=>{
                    console.log("DONE");
                }
            }
        });

        let otherDetails = document.getElementById("otherOrderDetails").children[0];
        console.log(otherDetails.children);

        let objectStore = openRequest.result.transaction("order_os", "readwrite").objectStore("order_os");

        let order = {
            orderID: document.getElementById("orderID").innerHTML,
            customerID: customerID,
            netAmount: document.getElementById("netTotal").innerHTML,
            discount: document.getElementById("orderDiscount").value,
            itemDetails: itemDetailsList,
            date: orderDate,
            time: orderTime
        }

        let addRequest = objectStore.add(order);

        addRequest.onsuccess = ()=>{
            location.href = "/We_Burgers-POS_System/receipt/index.html";
        }

    }else{
        alert("Invalid Customer ID")
    }
});

isValidCustomer = (customerID)=>{
    let isValid = false; 
    customers.forEach(element => {
        if (element.customerID == customerID) {
            isValid = true;
        }
    });
    return isValid;
}




