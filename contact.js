document.getElementById("contactForm").addEventListener("submit", function(e){
e.preventDefault();

let data = {
name:this[0].value,
email:this[1].value,
phone:this[2].value,
message:this[3].value
};

let messages = JSON.parse(localStorage.getItem("messages")) || [];
messages.push(data);

localStorage.setItem("messages", JSON.stringify(messages));

document.getElementById("successMsg").innerText = "Message Saved Successfully!";
this.reset();
});