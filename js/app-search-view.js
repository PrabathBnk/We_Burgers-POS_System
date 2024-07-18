document.getElementById("searchbar").addEventListener("keypress", function(event){
setTimeout(() => {
    let search = [];
    let searchField = document.getElementById("searchbar").value;

    if(isEmpty(searchField)){
        viewAllItems();
        return;
    }

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
   for (let i = 0; i < resultArray.length; i++) {
    resultBody += `<tr>
                        <td>${i+1}</td>
                        <td>${resultArray[i].itemCode}</td>
                        <td>${resultArray[i].name}</td>
                        <td class="price">${parseFloat(resultArray[i].price).toFixed(2)}</td>
                        <td>${resultArray[i].qty}</td>
                        <td>${isEmpty(resultArray[i].discount) ? "-":  resultArray[i].discount + "%"}</td>
                        <td>${resultArray[i].expDate}</td>
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
