document.getElementById("searchbar").addEventListener("keypress", function(event){
    objectStore = openRequest.result.transaction("item_os", "readonly").objectStore("item_os");

    let getAllRequest = objectStore.getAll();
    getAllRequest.onsuccess = ()=>{
        itemList = getAllRequest.result;
    }
    setTimeout(() => {
        l1: for (let i = 0; i < orderItemList.length; i++) {
            for (let j = 0; j < itemList.length; j++) {
                if(orderItemList[i].itemCode == itemList[j].itemCode){
                    itemList.splice(j, 1);
                    continue l1;
                }
            }
        }

        let search = [];
        let searchField = document.getElementById("searchbar").value;

        for(let i = 0; i < searchField.length; i++){
           search.push(searchField[i].toLowerCase());
        }
       
        let resultArray = [];
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
    
       let resultBody = ``;

       if(resultArray.length != 0){
            document.getElementById("resultContainer").hidden = false;
       }else{
        document.getElementById("resultContainer").hidden = true;
       }

       for (let i = 0; i < resultArray.length; i++) {
            resultBody += `<tr id="${"item" + i}" onclick="setItemToOrder(event)">
                                <td>${resultArray[i].itemCode}</td>
                                <td>${resultArray[i].name}</td>
                                <td class="price">${parseFloat(resultArray[i].price).toFixed(2)}</td>
                                <td>${isEmpty(resultArray[i].discount) ? "-":  resultArray[i].discount + "%"}</td>
                                <td>${resultArray[i].expDate}</td>
                            </tr>`;
        };
    
       document.getElementById("searchResults").innerHTML = resultArray[0] == "" ?  ``: resultBody;

    }, 5);
});

document.getElementById("searchbar").addEventListener("keydown", function(event){
    if(event.key == "Backspace"){
        document.getElementById("searchbar").dispatchEvent(new Event("keypress"));
    }
});

calcTotAmount = (event)=>{
    let tr = event.target.parentElement.parentElement;
    let price = parseFloat(tr.children[3].innerHTML);
    let qty = parseFloat(tr.children[4].firstElementChild.value);
    let discount = parseFloat(tr.children[5].innerHTML == "-" ? "0": tr.children[5].innerHTML);
    let totAmount = tr.children[6];

    let item;
    orderItemList.forEach(element => {
        if(element.no == tr.children[0].innerHTML){
            item = element;
            return;
        }
    });
    
    item.qty = qty;
    item.totalAmount = (price * qty) - ((price * discount / 100) * qty);

    totAmount.innerHTML = (item.totalAmount).toFixed(2);
    
    calculateTotal();
}

let orderItemList = [];
setItemToOrder = (event)=>{
    let itemCode = event.target.parentElement.children[0].innerHTML;
    
    let item;
    itemList.forEach(element => {
        if(itemCode == element.itemCode){
            item = element;
            return;
        }
    });

    let tbody = document.getElementById("orderItems");  
    let no = tbody.children.length + 1;
    
    orderItemList.push({
        no: no,
        itemCode: item.itemCode,
        qty: 1,
        totalAmount: calcTot(item.discount, item.price)
    })
    
    tbody.innerHTML += `<tr>
                            <td>${no}</td>
                            <td>${item.itemCode}</td>
                            <td>${item.name}</td>
                            <td>${parseFloat(item.price).toFixed(2)}</td>
                            <td class="qty"><input onchange="calcTotAmount(event)" type="number" min="1" value="1"></td>
                            <td>${isEmpty(item.discount) ? "-":  item.discount + "%"}</td>
                            <td>${(orderItemList[orderItemList.length-1].totalAmount).toFixed(2)}</td>
                            <td class="remove-btn"><button id="btnRemoveItem" onclick="removeItem(event)" class="btn">-</button><td>
                        </tr>`;

    
    document.getElementById("searchbar").value = "";
    document.getElementById("resultContainer").hidden = true;

    let elementList = document.getElementsByClassName("qty");
    for (let i = 0; i < orderItemList.length; i++) {
        elementList[i].firstElementChild.value = orderItemList[i].qty;
    }

    calculateTotal();
};


calcTot = (discount, price)=>{
    let intDiscount = parseFloat(isEmpty(discount) ? "0": discount);
    let intPrice = parseFloat(price);

    return intPrice - (intPrice * intDiscount / 100);
}