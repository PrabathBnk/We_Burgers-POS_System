let monthName = getMonthName(parseInt(localStorage.getItem("month"))) ;

document.getElementById("heading").innerHTML += monthName;

let ordersOfMonth = [];

orders = JSON.parse(localStorage.getItem("orders"));

isOrdersAvailable = () =>{
    let month = localStorage.getItem("month");
    
    
    orders.forEach(element => {
        let orderMonth = new Date(element.date).getMonth() + 1;
        if(month == orderMonth){
            ordersOfMonth.push(element);
        }
    });
    
    return ordersOfMonth.length != 0;
}

if(!isOrdersAvailable()){
    throw new Error("");
}else{
    document.getElementById("loader").style.visibility = "visible";
    setTimeout(() => {
        let img = document.getElementById("loader").children[0];
        let loaderbg = document.getElementById("loader").children[1];
        document.getElementById("loader").style.visibility = "hidden";
    }, 3000);
}

customers = JSON.parse(localStorage.getItem("customers"));

let ordersOfCustomers = [];

customers.forEach(customer => {
    let total = 0;
    ordersOfMonth.forEach(order => {
        if(order.customerID == customer.customerID){
            total += parseFloat(order.netAmount);
        }
    });
    ordersOfCustomers.push({
        no: 0,
        customerId: customer.customerID,
        name: customer.name,
        address: customer.address,
        totPurchase: total
    })
});


for (let i = 0; i < ordersOfCustomers.length-1; i++) {
    for (let j = i+1; j < ordersOfCustomers.length; j++) {
        if(ordersOfCustomers[i].totPurchase < ordersOfCustomers[j].totPurchase){
            let temp = ordersOfCustomers[i].totPurchase;
            ordersOfCustomers[i].totPurchase = ordersOfCustomers[j].totPurchase;
            ordersOfCustomers[j].totPurchase = temp;
        }
    }
}

//-----------Set Number------------
for (let i = 0; i < ordersOfCustomers.length; i++) {
    ordersOfCustomers[i].no = i + 1;
}


jsreport.serverUrl = "https://prabathbnk.jsreportonline.net";
jsreport.headers['Authorization'] = "Basic " + btoa("prabathBnk:123456@");

async function reportGenerating(){
    let report = await jsreport.render({
        template: {
          name: 'report_01'    
        },
        data: {
            month: monthName,
            customers:ordersOfCustomers
        }
    });


    let { pdfjsLib } = globalThis; 
    let docURL = await report.toObjectURL();
    pdfjsLib.getDocument(await docURL).promise.then(pdf =>{
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
}

document.getElementById("btnDownload").addEventListener("click", async function(){
    let report = await jsreport.render({
        template: {
          name: 'report_01'    
        },
        data: {
            month: monthName,
            customers:ordersOfCustomers
        }
    });

    report.download("Customers with Highest Rate of Purchases - " + monthName);
});

reportGenerating();
