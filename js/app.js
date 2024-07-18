let db;

const openRequest = indexedDB.open("we_burgers", 1);

openRequest.onupgradeneeded = (event)=>{
    db = event.target.result;

    let objectStore = db.createObjectStore("item_os", {
        keyPath: "itemCode"
    });

    objectStore.createIndex("name", "name", {unique: true});
    objectStore.createIndex("price", "price", {unique: false});
    objectStore.createIndex("qty", "qty", {unique: false});
    objectStore.createIndex("discount", "discount", {unique: false});
    objectStore.createIndex("expDate", "expDate", {unique: false});


    objectStore = db.createObjectStore("order_os",{
        keyPath: "orderID"
    });

    objectStore.createIndex("customerID", "customerID", {unique: false});
    objectStore.createIndex("netAmount", "netAmount", {unique: false});
    objectStore.createIndex("discount", "discount", {unique: false});
    objectStore.createIndex("date", "date", {unique: false});
    objectStore.createIndex("time", "time", {unique: false});
    objectStore.createIndex("itemDetails", "itemDetails", {unique: false});


    objectStore = db.createObjectStore("customer_os", {
        keyPath: "customerID"
    })

    objectStore.createIndex("name", "name", {unique: false});
    objectStore.createIndex("address", "address", {unique: false});
}

openRequest.onsuccess = ()=>{
    //console.log("Database opened successfully");
}

let items;
let itemCode;
//-----------------------------Generate Item Code--------------------------------
setItemCode = ()=>{
    let transaction = openRequest.result.transaction("item_os");
    const objectStore = transaction.objectStore("item_os");

    
    const getRequest = objectStore.getAll();
    getRequest.onsuccess = ()=>{
        items = getRequest.result;
        itemCode = "B" + (1000 + items.length + 1);
        document.getElementById("itemCode").innerHTML = itemCode; 
    }   
}

//----------------------------------Item Adding------------------------
addItem = ()=>{
    const name = document.getElementById("txtName");
    const price = document.getElementById("txtPrice");
    const qty = document.getElementById("txtQty");
    const discount = document.getElementById("txtDiscount");
    const expDate = document.getElementById("txtExpDate");

    let valueArray = [name, price, qty, discount, expDate];

    let isError = false;

    for (let i = 0; i < valueArray.length; i++) {
        if(isEmpty(valueArray[i].value) && i != 3){
            valueArray[i].parentElement.style.backgroundColor = "#FEEAEB";
            valueArray[i].labels[0].style.color = "#F1303A";
            if(valueArray[i].parentElement.children.length == 2){
                valueArray[i].parentElement.insertAdjacentElement("beforeend", errorMessage("This field is required"));
            }
            isError = true;
        }else{
            valueArray[i].parentElement.style.backgroundColor = "#F3F3F4";
        }
    }
    if(isError){return;}
    

    items.forEach(element => {
        if(element.name == name.value){
            alert("An item already exists with this name.");
            isError = true;
        }
    });
    if(isError){return;}

    for (let i = 1; i < valueArray.length-1; i++) {
        if(i == 3){
            if(isEmpty(valueArray[3].value) || parseFloat(valueArray[3].value) >= 0){
                i++;
            }  
        }
        if(!isValid(valueArray[i].value)){
            valueArray[i].parentElement.style.backgroundColor = "#FEEAEB";
            valueArray[i].labels[0].style.color = "#F1303A";
            if(valueArray[i].parentElement.children.length == 2){
                valueArray[i].parentElement.insertAdjacentElement("beforeend", errorMessage("Invalid amount"));
            }
            isError = true;
        }else{
            valueArray[i].parentElement.style.backgroundColor = "#F3F3F4";
        }
    }

    if(isError){return;}

    db = openRequest.result;
    const transaction = db.transaction("item_os", "readwrite");
    const objectStore = transaction.objectStore("item_os");

    const addRequest = objectStore.add({
        itemCode: itemCode,
        name: name.value,
        price: price.value,
        qty: qty.value,
        discount: discount.value,
        expDate: expDate.value
    });

    addRequest.onsuccess = ()=>{
        alert("Item Added Successfully!")
        location.reload();
    }

}

isEmpty = (str)=>{
    return str.trim().length === 0;
}

errorMessage = (message)=>{
    //---------------Error Message--------------------
    let error = document.createElement("p");
    error.innerHTML = message;
    error.classList.add("error-msg");

    return error;
}

isValid = (content)=>{
    let intContent = parseFloat(content);
    return intContent > 0;
}




//------------------------------Deleting Item-------------------------------
deleteItem = ()=>{
    if(searchResult){
        if(confirm("Permenetly delete this item?")){
            const transaction = openRequest.result.transaction("item_os", "readwrite");
            const objectStore = transaction.objectStore("item_os");

            const deleteObj = objectStore.delete(searchResult.itemCode);

            deleteObj.onsuccess = ()=>{
                document.getElementById("btnMainFunc").disabled = true;
                location.reload();
            }
            searchResult = undefined;
        }
    }
}


//---------------------------Update Item--------------------
updateItem = ()=>{
    if(searchResult){
        if(confirm("Update this item?")){
            const transaction = openRequest.result.transaction("item_os", "readwrite");
            const objectStore = transaction.objectStore("item_os");

            const getObj = objectStore.get(searchResult.itemCode);
            
            getObj.onsuccess = ()=>{    
                console.log(items);
                let data = getObj.result;

                data.name = fields[1].value != searchResult.name ? fields[1].value : searchResult.name;
                data.price = fields[2].value != searchResult.price ? fields[2].value : searchResult.price;
                data.qty = fields[3].value != searchResult.qty ? fields[3].value : searchResult.qty;
                data.discount = fields[4].value != searchResult.discount ? fields[4].value : searchResult.discount;
                data.expDate = fields[5].value != searchResult.expDate ? fields[5].value : searchResult.expDate;

                const updateRequest = objectStore.put(data);
                updateRequest.transaction;

                updateRequest.onsuccess = ()=>{
                    document.getElementById("btnMainFunc").disabled = true;
                    location.reload();
                }
                searchResult = undefined;
            }
        }
    }
}


//-----------------------------View Item-----------------------
let itemList;
viewAllItems = ()=>{
    objectStore = openRequest.result.transaction("item_os", "readonly").objectStore("item_os");

    let getAllRequest = objectStore.getAll();
    let tblBody = ``;
    getAllRequest.onsuccess = ()=>{
        itemList = getAllRequest.result;
        for (let i = 0; i < itemList.length; i++) {
            tblBody += `<tr>
                            <td>${i+1}</td>
                            <td>${itemList[i].itemCode}</td>
                            <td>${itemList[i].name}</td>
                            <td class="price">${parseFloat(itemList[i].price).toFixed(2)}</td>
                            <td>${itemList[i].qty}</td>
                            <td>${isEmpty(itemList[i].discount) ? "-":  itemList[i].discount + "%"}</td>
                            <td>${itemList[i].expDate}</td>
                        </tr>`
        }

        document.getElementById("viewTblBody").innerHTML = tblBody;
    }
}
