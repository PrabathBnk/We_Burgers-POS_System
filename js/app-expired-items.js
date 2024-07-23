viewExpiredItems = ()=>{
    let tblBody = ``;
    for (let i = 0; i < expiredItems.length; i++) {
        tblBody += `<tr>
                        <td>${i + 1}</td>
                        <td>${expiredItems[i].itemCode}</td>
                        <td>${expiredItems[i].name}</td>
                        <td>${parseFloat(expiredItems[i].price).toFixed(2)}</td>
                        <td>${expiredItems[i].qty}</td>
                        <td>${isEmpty(expiredItems[i].discount) ? "-":  expiredItems[i].discount + "%"}</td>
                        <td>${(expiredItems[i].expDate)}</td>
                        <td class="remove-btn"><button id="btnRemoveItem" onclick="removeItem(event)" class="btn">-</button><td>
                    </tr>`;
    }
    console.log(expiredItems);
    document.getElementById("viewItemsBody").innerHTML = tblBody;
}

removeItem = (event)=>{
    let itemNo = event.target.parentElement.parentElement.children[0].innerHTML;

    searchResult = expiredItems[itemNo-1];
    deleteItem();
    expiredItems.splice[itemNo-1, itemNo];
    console.log(expiredItems);

    
}
