let db;

let itemList;
let expiredItems = [];
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
    let getOrderReuest = openRequest.result.transaction("order_os").objectStore("order_os").getAll()
    let getCustomerReuest = openRequest.result.transaction("customer_os").objectStore("customer_os").getAll()
    let getItemRequest  = openRequest.result.transaction("item_os").objectStore("item_os").getAll()
    
    getItemRequest.onsuccess = ()=>{
        itemList = getItemRequest.result;
        localStorage.setItem("items", JSON.stringify(getItemRequest.result));

        let today = getToday();
        itemList.forEach(element => {
            if (Date.parse(element.expDate) <= Date.parse(today)) {
                expiredItems.push(element);
            }
        });
    }

    getCustomerReuest.onsuccess = ()=>{
        let customers = getCustomerReuest.result;
        localStorage.setItem("customers", JSON.stringify(customers));
    }
    getOrderReuest.onsuccess = ()=>{
        let orders = getOrderReuest.result;
        localStorage.setItem("orders", JSON.stringify(orders));
    }
}

document.getElementsByClassName("slidebar-logo")[0].addEventListener("click", function(){
    location.href = "/home/index.html";
});

expiredNotification = ()=>{
    setTimeout(() => {
        if(expiredItems.length > 0){
            document.getElementById("expItemCount").innerHTML = expiredItems.length;
            document.getElementById("expItemCount").classList.remove("opacity-0");
        }else{
            document.getElementById("expItemCount").classList.add("opacity-0");
        }
    }, 10);
}

//--------------------------------Get Today-----------------------------
getToday = ()=>{
    let date = new Date();
    let today = date.getFullYear() + "-" + ("00" + (date.getMonth() + 1)).slice(-2) + "-" + ("00" + date.getDate()).slice(-2);
    
    return today;
} 

let items;
let itemCode;

//-----------------------------Generate Item Code--------------------------------
setItemCode = ()=>{
    let objectStore;
    let getRequest;

    try {
        objectStore = openRequest.result.transaction("item_os").objectStore("item_os");
        getRequest = objectStore.getAll();
    } catch (error) {
        location.reload();
    } finally{
        setTimeout(() => {
            document.getElementById("loader").style.visibility = "visible";
        }, 5);
        setTimeout(() => {
            let img = document.getElementById("loader").children[0];
            let loaderbg = document.getElementById("loader").children[1];
            document.getElementById("loader").style.visibility = "hidden";
        }, 1000);
    }

    getRequest.onsuccess = ()=>{
        items = getRequest.result;
        itemCode = "B" + (1000 + items.length + 1);
        document.getElementById("itemCode").innerHTML = itemCode; 
    }   
}

//----------------------------------Adding Item------------------------
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
                if(document.getElementById("btnMainFunc") !== null){
                    document.getElementById("btnMainFunc").disabled = true;
                }
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
viewAllItems = ()=>{
    objectStore = openRequest.result.transaction("item_os", "readonly").objectStore("item_os");

    let getAllRequest = objectStore.getAll();
    let tblBody = ``;
    getAllRequest.onsuccess = ()=>{
        itemList = getAllRequest.result;
        items = itemList;
        for (let i = 0; i < itemList.length; i++) {
            let isInvalidItem = isExpiredItem(itemList[i]) || isOutOfStockItem(itemList[i]);
            tblBody += `<tr class="${isInvalidItem ? "warning": ""}">
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


//-----------------------------Get All Items-------------------------
getItems = ()=>{
    let objectStore = openRequest.result.transaction("item_os").objectStore("item_os");
    let getRequest = objectStore.getAll();
    getRequest.onsuccess = ()=>{
        items = getRequest.result;
    }
}

//----------------------------Get All Customers-------------------------
let customers;
getCustomers = ()=>{
    let transaction = openRequest.result.transaction("customer_os");
    const objectStore = transaction.objectStore("customer_os");

    const getRequest = objectStore.getAll();

    getRequest.onsuccess = ()=>{
        customers = getRequest.result;
    }
}

//--------------------------------Adding Customer------------------------
addCustomer = ()=>{
    const name = document.getElementById("txtName");
    const customerID = document.getElementById("txtCustID");
    const address = document.getElementById("txtAddress");

    let valueArray = [customerID, name, address];

    let isError = false;

    customerID.dispatchEvent(new Event("submitter"))

    for (let i = 0; i < valueArray.length-1; i++) {
        if(isEmpty(valueArray[i].value)){
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
    
    if(!isValidNumber(customerID.value)){
        customerID.parentElement.style.backgroundColor = "#FEEAEB";
        customerID.labels[0].style.color = "#F1303A";
        if(customerID.parentElement.children.length == 2){
            customerID.parentElement.insertAdjacentElement("beforeend", errorMessage("Enter Valid Conatct Number : 0xxxxxxxxx"));
        }
        isError = true;
    }
    if(isError){return;}

    if(isNumberExists(customerID.value)){
        alert("A customer already exists with this Conatct Number.");
        isError = true;
    }

    if(isError){return;}

    const objectStore = openRequest.result.transaction("customer_os", "readwrite").objectStore("customer_os");

    const addRequest = objectStore.add({
        customerID: customerID.value,
        name: name.value,
        address: address.value
    });

    addRequest.onsuccess = ()=>{
        alert("Customer Added Successfully!")
        location.reload();
    }
}

isNumberExists = (customerID)=>{
    return customers.find((element) => element.customerID == customerID);
}

isValidNumber = (number)=>{
    if (number.length == 10 && number[0] == "0") {
        l1: for (let i = 1; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (number[i] == j.toString()) {
                    continue l1;
                }
            }
            return false;
        }
        return true;
    }else{
        return false;
    }
}

//------------------------------Deleting Customer-------------------------------
deleteCustomer = ()=>{
    if(searchResult){
        if(confirm("Permenetly delete this customer?")){
            const transaction = openRequest.result.transaction("customer_os", "readwrite");
            const objectStore = transaction.objectStore("customer_os");

            const deleteObj = objectStore.delete(searchResult.customerID);

            deleteObj.onsuccess = ()=>{
                document.getElementById("btnMainFunc").disabled = true;
                location.reload();
            }
            searchResult = undefined;
        }
    }
}

//---------------------------Update Customer--------------------
updateCustomer = ()=>{
    if(confirm("Update this customer?")){
        const objectStore = openRequest.result.transaction("customer_os", "readwrite").objectStore("customer_os");

        const getObj = objectStore.get(searchResult.customerID);
        
        getObj.onsuccess = ()=>{   
            let data = getObj.result;

            data.name = fields[1].value;
            data.address = fields[2].value;

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

//-----------------------------View Customers-----------------------
let customerList;
viewAllCustomers = ()=>{
    getOrders();
    objectStore = openRequest.result.transaction("customer_os", "readonly").objectStore("customer_os");

    let getAllRequest = objectStore.getAll();
    let tblBody = ``;
    getAllRequest.onsuccess = ()=>{
        customerList = getAllRequest.result;
        for (let i = 0; i < customerList.length; i++) {
            tblBody += `<tr>
                            <td>${i+1}</td>
                            <td>${customerList[i].customerID}</td>
                            <td>${customerList[i].name}</td>
                            <td>${customerList[i].address}</td>
                            <td><a class="items-link" onclick="toOrders(event)">${calcTotPurchases(customerList[i].customerID).toFixed(2)}</a></td>
                        </tr>`
        }

        document.getElementById("viewTblBody").innerHTML = tblBody;
    }
}


//-------------------------Generate Order ID--------------------------
let orderDate;
let orderTime;
generateOrderID = ()=>{ 
    let objectStore;
    let getRequest;
    
    try {
        getItems();
        objectStore = openRequest.result.transaction("order_os", "readonly").objectStore("order_os");
        getRequest = objectStore.getAll();   
    } catch (error) {
        location.reload();
    } finally{
        document.getElementById("loader").style.visibility = "visible";
        setTimeout(() => {
            let img = document.getElementById("loader").children[0];
            let loaderbg = document.getElementById("loader").children[1];
            document.getElementById("loader").style.visibility = "hidden";
        }, 1000);
    }

    

    getRequest.onsuccess = ()=>{
        let orderID = document.getElementById("orderID");
        let orders = getRequest.result;

        let no = 1;

        if(orders.length != 0){
            let lastID = (orders[orders.length - 1]).orderID;
            no = parseInt((lastID).slice(1,5)) + 1;
        }
        
        let id = "O" + (("0000" + (no)).slice(-4));


        orderID.innerHTML = id;
    }

    //-------------------Make Continue Button disabled when page is loaded------------
    document.getElementById("btnContinue").disabled = true; 

    //------------------Set Date and Time-----------------
    const date = new Date(Date());
    document.getElementById("dateAndTime").innerHTML = `Date: ${orderDate = date.toLocaleDateString()}<br>Time ${orderTime = date.toLocaleTimeString()}`;
}


//-------------------------Remove Item from Order-------------------
removeItem = (event)=>{
    let tr = event.target.parentElement.parentElement;
    let removeItemNo = parseInt(tr.children[0].innerHTML);
    let resultTBody = tr.parentElement;

    document.getElementById("orderItems").removeChild(tr);

    for (let i = parseInt(removeItemNo)-1; i < resultTBody.children.length; i++) {
        resultTBody.children[i].children[0].innerHTML = i + 1;
        orderItemList[i+1].no = i + 1;
    }

    orderItemList.splice(removeItemNo-1, 1);
    calculateTotal();
}


let orders;
//--------------------------Get All Orders----------------------
getOrders = ()=>{
    let objectStore = openRequest.result.transaction("order_os").objectStore("order_os");
    let getRequest = objectStore.getAll();

    getRequest.onsuccess = ()=>{
        orders = getRequest.result;
    }
}

//-----------------------Delete Order---------------------
delteOrder = ()=>{
    let result = JSON.parse(localStorage.getItem("result"));
    if(result){
        if(confirm("Permenetly delete this order?")){
            const transaction = openRequest.result.transaction("order_os", "readwrite");
            const objectStore = transaction.objectStore("order_os");

            const deleteObj = objectStore.delete(result.orderID);

            deleteObj.onsuccess = ()=>{
                localStorage.clear();
                document.getElementById("btnMainFunc").disabled = true;
                location.reload();
            }
        }
    }
}


//---------------------------Update Order----------------------
updateOrder = ()=>{
    let result = JSON.parse(localStorage.getItem("result"));
    let customerID = fields[1].value;
    let discount = fields[3].value == "" ? 0: fields[3].valueAsNumber;
    let newItemDetails = result.itemDetails;

    if(result.customerID != customerID && isNumberExists(customerID)){
        alert("A customer already exists with this Conatct Number.")
    }else if(isNaN(discount) || discount < 0 || parseFloat(result.netAmount) < discount){
        alert("Invalid discount amount.")
    }else{
        const objectStore = openRequest.result.transaction("order_os", "readwrite").objectStore("order_os");
        const getObj = objectStore.get(result.orderID);
        
        getObj.onsuccess = ()=>{   
            let data = getObj.result;

            let currentItemDetails = data.itemDetails;

            const itemObjectStore = openRequest.result.transaction("item_os", "readwrite").objectStore("item_os");
            for (let i = 0; i < newItemDetails.length; i++) {
                let getRequest = itemObjectStore.get(newItemDetails[i].itemCode);
            
                getRequest.onsuccess = ()=>{
                    let item = getRequest.result;
                    item.qty = parseFloat(item.qty) + (currentItemDetails[i].qty - newItemDetails[i].qty);
                    let updateRequest = itemObjectStore.put(item);
                    updateRequest.transaction;
    
                    updateRequest.onsuccess = ()=>{
                        console.log("DONE");
                    }
                }
            }

            data.customerID = customerID;
            data.discount = discount == 0 ? "" : discount.toString();
            data.netAmount = fields[2].innerHTML;
            data.itemDetails = newItemDetails;

            const updateRequest = objectStore.put(data);
            updateRequest.transaction;

            updateRequest.onsuccess = ()=>{
                localStorage.clear();
                document.getElementById("btnMainFunc").disabled = true;
                location.reload();
            }
        }
    }
}


//-----------------------------View Order-----------------------
viewAllOrders = ()=>{
    objectStore = openRequest.result.transaction("order_os", "readonly").objectStore("order_os");

    let getAllRequest = objectStore.getAll();
    let tblBody = ``;
    getAllRequest.onsuccess = ()=>{
        orders = getAllRequest.result;
        for (let i = 0; i < orders.length; i++) {
            tblBody += `<tr>
                            <td>${i+1}</td>
                            <td>${orders[i].orderID}</td>
                            <td>${orders[i].customerID}</td>
                            <td>${parseFloat(orders[i].netAmount).toFixed(2)}</td>
                            <td>${isEmpty(orders[i].discount) || parseFloat(orders[i].discount) == 0 ? "-": orders[i].discount}</td>
                            <td>${orders[i].date}</td>
                            <td>${orders[i].time}</td>
                            <td><a class="items-link" onclick="toItemDetails(event)">View Details</a></td>
                        </tr>`
        }

        document.getElementById("viewTblBody").innerHTML = tblBody;
    }
}

test = ()=>{
    getOrders();

    setTimeout(() => {
        console.log(orders);
    }, 10);
}

//-----------------Option List--------------
optionList = (event)=>{
    let list = document.getElementById("optionList" + event.target.id);
    let classList = list.classList;
    if(classList[classList.length - 1] != "list-opened"){
        list.classList.add("list-opened");
        event.target.classList.add("rotateDown")
    }else{
        list.classList.remove("list-opened");
        event.target.classList.remove("rotateDown")
    }
}

//----------------------Insufficient Item Quantity--------------------
isInsufficientStock = (newItemDetails)=>{
    for (let i = 0; i < newItemDetails.length; i++) {
        if(items[i].itemCode == newItemDetails[i].itemCode){
            if(items[i].qty < newItemDetails[i].qty){
                alert("Insufficient Item Quantity: " + newItemDetails[i].itemCode);
                return true;
            }
        }
    }
    return false;
}

//-----------------Is Expired Item-------------------
isExpiredItem = (item)=>{
    let isExpired = false;
    expiredItems.forEach(element => {
        if(element.itemCode == item.itemCode){
            isExpired = true;
        }
    });
    return isExpired;
}

//----------------Is Out of Stock Item---------------
isOutOfStockItem = (item)=>{
    let items = JSON.parse(localStorage.getItem("items"));
    let isOutOfStock = false;
    items.forEach(element => {
        if(element.itemCode == item.itemCode){
            if(element.qty == 0){
                isOutOfStock = true;
            }
        }
    });
    return isOutOfStock;
}


//------------------Set Data to Pages-------------------
setOrdersData = ()=>{
    let orders = JSON.parse(localStorage.getItem("orders"));
    
    setTimeout(() => {
        document.getElementById("totalOrders").innerHTML = orders.length < 10 ? ("00" + orders.length).slice(-2) : orders.length;
        let total = 0;
        orders.forEach(element => {
            total += parseFloat(element.netAmount);
        });

        if(total >= 1000000){
            total = (total / 1000000).toFixed(1);
            total += "M";
        }else if(total >= 10000){
            total = (total / 1000).toFixed(1);
            total += "K";
        }

        document.getElementById("totalOrderAmout").innerHTML = total;
    }, 10);
}

setItemsData = ()=>{
    let items = JSON.parse(localStorage.getItem("items"));
    
    setTimeout(() => {
        document.getElementById("totalItems").innerHTML = items.length < 10 ? ("00" + items.length).slice(-2) : items.length;
        document.getElementById("totalExpiredItems").innerHTML = expiredItems.length < 10 ? ("00" + expiredItems.length).slice(-2) : expiredItems.length;
        let totOutOfStockItems = 0;
        
        if(items.length != 0){
            items.forEach(element => {
                if(isOutOfStockItem(element)){
                    totOutOfStockItems++;
                }
            });
        }
        
        document.getElementById("totalOutOfStockItems").innerHTML = totOutOfStockItems < 10 ? ("00" + totOutOfStockItems).slice(-2) : totOutOfStockItems;

    }, 10);
}

setCustomersData = ()=>{
    let customers = JSON.parse(localStorage.getItem("customers"));

    setTimeout(() => {
        document.getElementById("totalCustomers").innerHTML = customers.length < 10 ? ("00" + customers.length).slice(-2) : customers.length;
    }, 10);
}

