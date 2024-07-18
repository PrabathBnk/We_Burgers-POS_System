
getItems = ()=>{
    let trasaction = openRequest.result.transaction("item_os", "readwrite");
    let objectStore = trasaction.objectStore("item_os");

    let getReuest = objectStore.getAll();

    getReuest.onsuccess = ()=>{
        items = getReuest.result;
    }

    //-----Make the main function button desabled when the page loaded
    document.getElementById("btnMainFunc").disabled = true;
}

document.getElementById("searchbar").addEventListener("keydown", function(evnt){
    if(event.key === "Enter"){
        document.getElementById("searchIcon").click();
    }
});


let searchResult;
let fields = [
    document.getElementById("itemCode"),
    document.getElementById("name"),
    document.getElementById("price"),
    document.getElementById("qty"),
    document.getElementById("discount"),
    document.getElementById("expDate")
]

document.getElementById("searchIcon").addEventListener("click", function(){
    
    let searchInfo = document.getElementById("searchbar").value;
    let result;
    if(!isEmpty(searchInfo)){
        items.forEach(element => {
            if(element.name == searchInfo || element.itemCode == searchInfo){
                result = element;
            }
        });

        if(document.getElementById("heading").innerHTML == "Delete Item"){
            setDetailsToLabels(searchResult = result);
        }else if(document.getElementById("heading").innerHTML == "Update Item"){
            setDetailsToInputs(searchResult = result);
        }
    }
});

setDetailsToLabels = (result)=>{
    if(result){
        fields[0].innerHTML = result.itemCode; 
        fields[1].innerHTML = result.name;
        fields[2].innerHTML = parseFloat(result.price).toFixed(2); 
        fields[3].innerHTML = result.qty;
        fields[4].innerHTML = isEmpty(result.discount) ? "0":  result.discount + "%";
        fields[5].innerHTML = result.expDate;
        document.getElementById("btnMainFunc").disabled = false;
        searchResult = result;
    }else{
        alert("There is no item found")
        fields.forEach(element => {
            element.innerHTML = "";
        });
        document.getElementById("btnMainFunc").disabled = true;
    }
}

setDetailsToInputs = (result)=>{
    if(result){
        fields[0].innerHTML = result.itemCode;
        fields[1].value = result.name;
        fields[2].value = result.price;
        fields[3].value = result.qty;
        fields[4].value = result.discount;
        fields[5].value = result.expDate;
        document.getElementById("btnMainFunc").disabled = false;
    }else{
        alert("There is no item found")
        fields[0].innerHTML = "";
        for (let i = 1; i < fields.length; i++) {
            fields[i].value = "";
        }
        document.getElementById("btnMainFunc").disabled = true;
    }
}
