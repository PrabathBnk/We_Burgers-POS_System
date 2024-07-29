onLoadFunc = ()=>{
    getOrders();

    let result = JSON.parse(localStorage.getItem("result"));
    let isBack = JSON.parse(localStorage.getItem("isBack"));

    if(isBack){
        setDetails(result);
        document.getElementById("searchbar").value = result.orderID;
        localStorage.removeItem("isBack");

        document.getElementById("btnMainFunc").disabled = false;
    }else{
        localStorage.clear()
        document.getElementById("btnMainFunc").disabled = true;
    }

    getCustomers();
}

let fields = [
    document.getElementById("orderID"),
    document.getElementById("customerID"),
    document.getElementById("netTotal"),
    document.getElementById("discount"),
    document.getElementById("dateTime"),
    document.getElementById("itemDetails")
]

searchOrders = ()=>{
    let searchInfo = document.getElementById("searchbar").value;
    let result;
    if(!isEmpty(searchInfo)){
        result = orders.find(element => (element.orderID).toLowerCase() == searchInfo.toLowerCase());
        if(!(JSON.parse(localStorage.getItem("isBack")))){localStorage.setItem("result", JSON.stringify(result));}
        
        setDetails(result);
    }
};

document.getElementById("searchbar").addEventListener("keypress", function(event){
    if(event.key == "Enter"){
        searchOrders();
    }
})

setDetails = (result)=>{
    if(result){
        fields[0].innerHTML = result.orderID;
        fields[2].innerHTML = netTotal();
        fields[4].innerHTML = result.date + " - " + result.time;
        fields[5].innerHTML = `<a class="items-link" href="item_details/index.html">View Details</a>`;

        if(document.getElementById("heading").innerHTML == "Delete Order"){
            fields[1].innerHTML = result.customerID;
            fields[3].innerHTML = isEmpty(result.discount) ? "0%" : result.discount + "%";
        }else{
            fields[1].value = result.customerID;
            if(isEmpty(result.discount.toString())){
                fields[3].placeholder = "-";
            }else{
                fields[3].value = result.discount;
            }
        }

        document.getElementById("btnMainFunc").disabled = false;
    }else{
        alert("There is no order found")
        fields.forEach(element => {
            element.innerHTML = "";
            element.value = "";
        });
        fields[3].placeholder = "";
        document.getElementById("btnMainFunc").disabled = true;
    }
}

netTotal = ()=>{
    let result = JSON.parse(localStorage.getItem("result"));
    let netTotal = 0;
    result.itemDetails.forEach(element => {
        netTotal += element.totalAmount;
    });

    netTotal -= isNaN(result.discount) ? 0: result.discount;

    return netTotal.toFixed(2);
}

onItemDetailsLoad = ()=>{
    let result = JSON.parse(localStorage.getItem("result"));

    document.getElementById("orderID").innerHTML = result.orderID;

    let resultTBody = ``;
    result.itemDetails.forEach(element => {
        resultTBody += `<tr>
                            <td>${element.no}</td>
                            <td>${element.itemCode}</td>
                            <td>${element.name}</td>
                            <td>${element.price}</td>
                            <td>${element.qty}</td>
                            <td>${element.discount == "" ? "0%" : element.discount}</td>
                            <td>${element.totalAmount.toFixed(2)}</td>
                        </tr>`;
    });

    document.getElementById("orderItemDetails").innerHTML = resultTBody;
}

onUpdateItemDetailsLoad = ()=>{
    getItems();

    let result = JSON.parse(localStorage.getItem("result"));
    
    document.getElementById("orderID").innerHTML = result.orderID;

    let resultTBody = ``;
    result.itemDetails.forEach(element => {
        resultTBody += `<tr>
                            <td>${element.no}</td>
                            <td>${element.itemCode}</td>
                            <td>${element.name}</td>
                            <td>${element.price}</td>
                            <td class="qty"><input onchange="calcTotAmount(event)" type="number" min="1" value="${element.qty}"></td>
                            <td>${element.discount == "" ? "0%" : element.discount}</td>
                            <td>${element.totalAmount.toFixed(2)}</td>
                        </tr>`;
    });

    document.getElementById("orderItemDetails").innerHTML = resultTBody;
}

calcTotAmount = (event)=>{
    let result = JSON.parse(localStorage.getItem("result"));

    let tr = event.target.parentElement.parentElement;
    let price = parseFloat(tr.children[3].innerHTML);
    let qty = parseFloat(tr.children[4].firstElementChild.value);
    let discount = parseFloat(tr.children[5].innerHTML == "-" ? "0": tr.children[5].innerHTML);
    let totAmount = tr.children[6];

    let item;
    result.itemDetails.forEach(element => {
        if(element.no == tr.children[0].innerHTML){
            item = element;
            return;
        }
    });
    
    item.qty = qty;
    item.totalAmount = (price * qty) - ((price * discount / 100) * qty);

    totAmount.innerHTML = (item.totalAmount).toFixed(2);
}

itemDetailsBack = ()=>{
    localStorage.setItem("isBack", true);
    location.href = "/We_Burgers-POS_System/orders/delete_order/index.html";
}

updateItemDetails = ()=>{
    let tblBody = document.getElementById("orderItemDetails");
    let newItemDetails = [];

    for (let i = 0; i < tblBody.children.length; i++) {
        newItemDetails.push({
            no: i+1,
            itemCode: tblBody.children[i].children[1].innerHTML,
            qty: tblBody.children[i].children[4].firstChild.valueAsNumber,
            totalAmount: parseFloat(tblBody.children[i].children[6].innerHTML)
        });
    }
  
    if(isInsufficientStock(newItemDetails)) return;
    
    if(confirm("Update Item Details?")){
        let result = JSON.parse(localStorage.getItem("result"));
        

        for (let i = 0; i < result.itemDetails.length; i++) {
            result.itemDetails[i].qty = tblBody.children[i].children[4].firstChild.valueAsNumber;
            result.itemDetails[i].totalAmount = parseFloat(tblBody.children[i].children[6].innerHTML);
        }
        
        localStorage.setItem("result", JSON.stringify(result));
    }
}


itemDetailsBackUpdate = ()=>{
    localStorage.setItem("isBack", true);
    location.href = "/We_Burgers-POS_System/orders/update_order/index.html";
}

setNetTotal = ()=>{
    let result = JSON.parse(localStorage.getItem("result"));
    let discount = document.getElementById("discount");
    result.discount = isNaN(discount.valueAsNumber) ? 0: discount.valueAsNumber;
    localStorage.setItem("result", JSON.stringify(result));

    document.getElementById("netTotal").innerHTML = netTotal();
}

callSetNetTotal = (event)=>{
    if(event.key == "Enter"){
        setNetTotal();
    }
}


//---------------------------------Search Item---------------------------------------
searchItem = (event)=>{
    objectStore = openRequest.result.transaction("item_os", "readonly").objectStore("item_os");

    let result = JSON.parse(localStorage.getItem("result"));
    let itemList = result.itemDetails;
    setTimeout(() => {
        let search = [];
        let searchField = event.target.value;
        let resultArray = [];

        if(isEmpty(searchField)){
            resultArray = itemList;
        }else{
            for(let i = 0; i < searchField.length; i++){
                search.push(searchField[i].toLowerCase());
             }
             
             for (let i = 0; i < search.length; i++) {
                if(i == 0){
                    itemList.forEach(element => {
                        if((search[0] == element.itemCode[0].toLowerCase()) || (search[0] == element.name[0].toLowerCase())){
                            resultArray.push(element);
                        }
                    });
                }else if(resultArray.length != 0){
                    let tempArray = [];
         
                     if((resultArray[0].name.length >= search.length) && (resultArray[0].itemCode.length >= search.length)){
                         resultArray.forEach(element => {
                                if((search[i] == element.name[i].toLowerCase()) || (search[i] == element.itemCode[i].toLowerCase())){
                                    tempArray.push(element);
                                }
                            });
         
                     }else if(resultArray[0].name.length >= search.length){
                         resultArray.forEach(element => {
                             if((search[i] == element.name[i].toLowerCase())){
                                 tempArray.push(element);
                             }
                         });
         
                     }else if(resultArray[0].itemCode.length >= search.length){
                         resultArray.forEach(element => {
                             if((search[i] == element.itemCode[i].toLowerCase())){
                                 tempArray.push(element);
                             }
                         });
                     }
         
                    resultArray = tempArray;
                }
             }
        }
    
       let resultBody = ``;
       


       for (let i = 0; i < resultArray.length; i++) {
            let qtyField;
            if(document.getElementById("heading").innerHTML[0] == "U"){
                    qtyField = `<td class="qty"><input onchange="calcTotAmount(event)" type="number" min="1" value="${resultArray[i].qty}"></td>`;
            }else{
                    qtyField = `<td>${resultArray[i].qty}</td>`
            }
            resultBody += `<tr>
                                <td>${resultArray[i].no}</td>
                                <td>${resultArray[i].itemCode}</td>
                                <td>${resultArray[i].name}</td>
                                <td>${resultArray[i].price}</td>
                                ${qtyField}
                                <td>${resultArray[i].discount == "" ? "0%" : resultArray[i].discount}</td>
                                <td>${resultArray[i].totalAmount.toFixed(2)}</td>
                            </tr>`;
        };
    
        

       document.getElementById("orderItemDetails").innerHTML = resultArray[0] == "" ?  ``: resultBody;

    }, 5);
};


//--------------------Back--------------------

backToView = ()=>{
    localStorage.clear();
    location.href = "/We_Burgers-POS_System/orders/view_order/index.html";
}
