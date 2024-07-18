onLoadFunc = ()=>{
    getCustomers();

    //-----Make the main function button desabled when the page loaded
    document.getElementById("btnMainFunc").disabled = true;
}

let fields = [
    document.getElementById("customerID"),
    document.getElementById("name"),
    document.getElementById("address"),
]

document.getElementById("searchIcon").addEventListener("click", function(){
    let searchInfo = document.getElementById("searchbar").value;
    let result;
    if(!isEmpty(searchInfo)){
        customers.forEach(element => {
            if(element.name == searchInfo || element.customerID == searchInfo){
                result = element;
            }
        });

        if(document.getElementById("heading").innerHTML == "Delete Customer"){
            setDetailsToLabels(searchResult = result);
        }else if(document.getElementById("heading").innerHTML == "Update Customer"){
            setDetailsToInputs(searchResult = result);
        }
    }
});

document.getElementById("searchbar").addEventListener("keydown", function(event){
    if(event.key === "Enter"){
        document.getElementById("searchIcon").click();
    }
});

setDetailsToLabels = (result)=>{
    if(result){
        fields[0].innerHTML = result.customerID; 
        fields[1].innerHTML = result.name;
        fields[2].innerHTML = isEmpty(result.address) ? "-": result.address;

        document.getElementById("btnMainFunc").disabled = false;
        searchResult = result;
    }else{
        alert("There is no customer found")
        fields.forEach(element => {
            element.innerHTML = "";
        });
        document.getElementById("btnMainFunc").disabled = true;
    }
}

setDetailsToInputs = (result)=>{
    if(result){
        fields[0].innerHTML = result.customerID; 
        fields[1].value = result.name;
        fields[2].value = result.address;

        document.getElementById("btnMainFunc").disabled = false;
    }else{
        alert("There is no customer found")
        fields.forEach(element => {
            element.value = "";
        });
        document.getElementById("btnMainFunc").disabled = true;
    }
}

