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
    let getItemRequest  = openRequest.result.transaction("item_os").objectStore("item_os").getAll()
    
    getItemRequest.onsuccess = ()=>{
        itemList = getItemRequest.result;

        let today = getToday();
        itemList.forEach(element => {
            if (Date.parse(element.expDate) <= Date.parse(today)) {
                expiredItems.push(element);
            }
        });
    }
}

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
    let transaction = openRequest.result.transaction("item_os");
    const objectStore = transaction.objectStore("item_os");

    
    const getRequest = objectStore.getAll();
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
                            <td><a class="items-link" onclick="toOrders(event)">${calcTotPurchases(customerList[i].customerID)}</a></td>
                        </tr>`
        }

        document.getElementById("viewTblBody").innerHTML = tblBody;
    }
}


//-------------------------Generate Order ID--------------------------
let orderDate;
let orderTime;
generateOrderID = ()=>{
    let objectStore = openRequest.result.transaction("order_os", "readonly").objectStore("order_os");
    let getRequest = objectStore.getAll();

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
    document.getElementById("dateAndTime").innerHTML = `Date: ${orderDate = date.toLocaleDateString()}<br>Time ${orderTime = date.toLocaleTimeString()}`
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

    if(result.customerID != customerID && isNumberExists(customerID)){
        alert("A customer already exists with this Conatct Number.")
    }else if(isNaN(discount) || discount < 0 || parseFloat(result.netAmount) < discount){
        alert("Invalid discount amount.")
    }else{
        const objectStore = openRequest.result.transaction("order_os", "readwrite").objectStore("order_os");

        const getObj = objectStore.get(result.orderID);
        
        getObj.onsuccess = ()=>{   
            let data = getObj.result;

            data.customerID = customerID;
            data.discount = discount.toString();
            data.netAmount = fields[2].innerHTML;
            data.itemDetails = result.itemDetails;

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

