let textBoxes = document.getElementsByClassName("text-box");

for (let i = 0; i < textBoxes.length; i++) {
    textBoxes[i].childNodes[3].addEventListener("focusin", function(){
        textBoxes[i].childNodes[1].classList.add("active");
    });

    textBoxes[i].childNodes[3].addEventListener("focusout", function(){
        if(!textBoxes[i].childNodes[3].value){
            textBoxes[i].childNodes[1].classList.remove("active");
        }
    });
}


