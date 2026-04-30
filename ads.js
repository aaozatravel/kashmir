const adsData = [
  {
    img: "https://i.ibb.co/zT85NZWm/In-Shot-20260428-165220055.jpg",
    link: "weading.html",
    delay: 8000,
    countdown: false
  },
  {
    img: "https://i.ibb.co/1JTtk9tB/voucher7.png",
    link: "coupon.html",
    delay: 10000,
    countdown: true
  }
];

let index = 0;
let timer;

function showAd(ad){

  document.getElementById("adImg").src = ad.img;
  document.getElementById("adLink").href = ad.link;
  document.getElementById("adPopup").style.display = "flex";

  let timerBox = document.getElementById("adTimer");
  let closeIcon = document.getElementById("adCloseIcon");

  clearInterval(timer);

  // reset UI
  timerBox.innerText = "";
  closeIcon.style.display = "inline";

  if(ad.countdown){

    closeIcon.style.display = "none";

    let t = 5;
    timerBox.innerText = t;

    timer = setInterval(() => {

      t--;
      timerBox.innerText = t;

      if(t <= 0){
        clearInterval(timer);
        timerBox.innerText = "";
        closeIcon.style.display = "inline";
      }

    }, 1000);

  }
}

function startAds(){

  if(index >= adsData.length) return;

  setTimeout(() => {
    showAd(adsData[index]);
  }, adsData[index].delay);

}

function closeAd(){
  document.getElementById("adPopup").style.display = "none";
  index++;
  startAds();
}

window.addEventListener("load", () => {

  // ❌ agar ads already dikha diye is session me
  if(sessionStorage.getItem("adsShown")){
    return;
  }

  // ✅ mark karo ki ads dikha diye
  sessionStorage.setItem("adsShown", "true");

  startAds();
});
