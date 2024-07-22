onLoadFunc = ()=>{
    getOrders();

    let result = JSON.parse(localStorage.getItem("result"));
    let isBack = JSON.parse(localStorage.getItem("isBack"));

    if(isBack){
        setDetailsToLabels(result);
        document.getElementById("searchbar").value = result.orderID;
        localStorage.removeItem("isBack");

        document.getElementById("btnMainFunc").disabled = false;
    }else{
        document.getElementById("btnMainFunc").disabled = true;
    }

    
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

        localStorage.setItem("result", JSON.stringify(result));
        setDetailsToLabels(result);
        // if(document.getElementById("heading").innerHTML == "Delete Customer"){
        //     setDetailsToLabels(searchResult = result);
        // }else if(document.getElementById("heading").innerHTML == "Update Customer"){
        //     setDetailsToInputs(searchResult = result);
        // }
    }
};

document.getElementById("searchbar").addEventListener("keypress", function(event){
    if(event.key == "Enter"){
        searchOrders();
    }
})

setDetailsToLabels = (result)=>{
    if(result){
        fields[0].innerHTML = result.orderID;
        fields[1].innerHTML = result.customerID;
        fields[2].innerHTML = netTotal(result.itemDetails);
        fields[3].innerHTML = isEmpty(result.discount) ? "0%" : result.discount + "%";
        fields[4].innerHTML = result.date + " - " + result.time;
        fields[5].innerHTML = `<a class="items-link" href="item_details/index.html">View Details</a>`

        document.getElementById("btnMainFunc").disabled = false;
    }else{
        alert("There is no order found")
        fields.forEach(element => {
            element.innerHTML = "";
        });
        document.getElementById("btnMainFunc").disabled = true;
    }
}

netTotal = (itemList)=>{
    let netTotal = 0;
    itemList.forEach(element => {
        netTotal += element.totalAmount;
    });

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
                        </tr>`
    });

    document.getElementById("viewItemDetails").innerHTML = resultTBody;
}

itemDetailsBack = ()=>{
    localStorage.setItem("isBack", true);
    location.href = "/orders/delete_order/index.html";
}
