let textBoxes = document.getElementsByClassName("text-box");

for (let i = 0; i < textBoxes.length; i++) {
    textBoxes[i].childNodes[3].addEventListener("focusin", function(){
        textBoxes[i].childNodes[1].classList.add("active");
        if(textBoxes[i].children.length == 3){
            textBoxes[i].removeChild(textBoxes[i].lastChild);
        }
        
    });

    textBoxes[i].childNodes[3].addEventListener("change", function(){
        if(textBoxes[i].childNodes[3].value){
            textBoxes[i].childNodes[1].classList.add("active");
        }else{
            textBoxes[i].childNodes[1].classList.remove("active");
        }
    });

    textBoxes[i].childNodes[3].addEventListener("focusout", function(){
        if(!textBoxes[i].childNodes[3].value){
            textBoxes[i].childNodes[1].classList.remove("active");
            if(textBoxes[i].children.length == 2 && i != 3){
                //---------------Error Message--------------------
                let error = document.createElement("p");
                error.innerHTML = "This field is required";
                error.classList.add("error-msg");

                textBoxes[i].appendChild(error);
            }
        }
    });
}


