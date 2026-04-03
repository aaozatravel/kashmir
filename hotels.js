function selectHotel(name){

let selectedHotels = JSON.parse(localStorage.getItem("selectedHotels")) || [];

if(selectedHotels.includes(name)){
selectedHotels = selectedHotels.filter(h => h !== name);
}else{
selectedHotels.push(name);
}

localStorage.setItem("selectedHotels", JSON.stringify(selectedHotels));

alert(name + " selection updated");
}