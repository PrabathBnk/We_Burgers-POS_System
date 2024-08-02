let pdfObject;

openRequest.onsuccess = ()=>{
    let db = openRequest.result;

    let order_os = db.transaction("order_os").objectStore("order_os");
    let customer_os = db.transaction("customer_os").objectStore("customer_os");

    let orderGetRequest = order_os.getAll();
    let customerGetRequest = customer_os.getAll();

    orderGetRequest.onsuccess = ()=>{
        orders = orderGetRequest.result;
    }
    customerGetRequest.onsuccess = ()=>{
        customers = customerGetRequest.result;
    }
}

generatePDF = ()=>{
    document.getElementById("loader").style.visibility = "visible";
    setTimeout(() => {
        let img = document.getElementById("loader").children[0];
        let loaderbg = document.getElementById("loader").children[1];
        document.getElementById("loader").style.visibility = "hidden";
    }, 1000);

    orders = JSON.parse(localStorage.getItem("orders"));
    customers = JSON.parse(localStorage.getItem("customers"))
    setTimeout(() => {
        console.log(orders);
        console.log(customers);
    
        let order = orders[orders.length - 1];
        console.log(order);

        //---------------------Set Order ID and Date & Time----------------------
        document.getElementById("orderID").innerHTML = order.orderID;
        document.getElementById("dateTime").innerHTML = `Date: ${order.date} &nbsp;&nbsp; Time: ${order.time}`;
        //-----------------------------------------------------------------------

        let customer = customers.find((element) => element.customerID == order.customerID);
        console.log(customer);

        let itemList = order.itemDetails;

        let total = 0;
        itemList.forEach(element => {
            total += element.totalAmount;
        });

        var props = {
            outputType: "datauristring",
            returnJsPDFDocObject: true,
            fileName: "Invoice - " + order.orderID,
            orientationLandscape: false,
            compress: true,
            logo: {
                src: "/We_Burgers-POS_System/img/logo_2.png",
                type: 'PNG', //optional, when src= data:uri (nodejs case)
                width: 22, //aspect ratio = width/height
                height: 27.13,
                margin: {
                    top: 0, //negative or positive num, from the current position
                    left: 5 //negative or positive num, from the current position
                }
            },
            stamp: {
                inAllPages: true, //by default = false, just in the last page
                src: "https://raw.githubusercontent.com/edisonneza/jspdf-invoice-template/demo/images/qr_code.jpg",
                type: 'JPG', //optional, when src= data:uri (nodejs case)
                width: 20, //aspect ratio = width/height
                height: 20,
                margin: {
                    top: 0, //negative or positive num, from the current position
                    left: 0 //negative or positive num, from the current position
                }
            },
            business: {
                name: "We Burgers",
                address: "+94 77 777 7777",
                phone: "www.weburgers.com",
                email: "weburgers@example.com",
                email_1: "weburgers.cs@example.com",
                website: "",
            },
            contact: {
                label: "Invoice issued for:",
                name: customer.name,
                address: customer.address,
                phone: customer.customerID,
            },
            invoice: {
                label: "Invoice: Order ID | ",
                num: order.orderID,
                invDate: "Date: " + order.date,
                invGenDate: "Time : " + order.time,
                headerBorder: false,
                tableBodyBorder: false,
                header: [
                {
                    title: "No", 
                    style: { 
                    width: 10 
                    } 
                }, 
                { 
                    title: "Item Code",
                    style: {
                    width: 25
                    } 
                }, 
                { 
                    title: "Item Name",
                    style: {
                    width: 55
                    } 
                }, 
                { title: "Price"},
                { title: "Quantity"},
                { title: "Discount"},
                { title: "Total Amount"}
                ],
                table: Array.from(Array(itemList.length), (item, index)=>([
                    itemList[index].no + "        ",
                    itemList[index].itemCode,
                    itemList[index].name,
                    itemList[index].price,
                    itemList[index].qty,
                    itemList[index].discount,
                    itemList[index].totalAmount
                ])),
                additionalRows: [{
                    col1: 'Total:',
                    col2: (total.toFixed(2)).toString(),
                },
                {
                    col1: 'Discount:',
                    col2: order.discount == "" ? "-": order.discount,
                },
                {
                    col1: "Net Total:",
                    col2: (parseFloat(order.netAmount).toFixed(2)).toString(),
                }]
            },
            footer: {
                text: "The invoice is created on a computer and is valid without the signature and stamp.",
            },
            pageEnable: true,
            pageLabel: "Page ",
        };
            
        pdfObject = jsPDFInvoiceTemplate.default(props);
    
        let { pdfjsLib } = globalThis;
        
        const pdfViewer = pdfjsLib.getDocument(pdfObject.dataUriString);
    
        pdfViewer.promise.then(pdf =>{
            pdf.getPage(1).then(page=>{
                const scale = 1.5;
                const viewport = page.getViewport({ scale });
    
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
    
                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
    
                page.render(renderContext);
                document.getElementById("invoice").appendChild(canvas);
            })
        })
    }, 20);
}

document.getElementById("btnDownload").addEventListener("click", function(){
    pdfObject.jsPDFDocObject.save("Invoice - " + orders[orders.length - 1].orderID);
});

