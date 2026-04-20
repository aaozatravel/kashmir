// 🔥 CREATE BUTTON
const btn = document.createElement("button")
btn.innerText = "‹"
btn.className = "back-btn"

// 🔥 FUNCTION
btn.onclick = function(){
  if(history.length > 1){
    history.back()
  }else{
    window.location.href = "index.html"
  }
}

// 🔥 ADD TO PAGE
document.body.appendChild(btn)