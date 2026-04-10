let packages = JSON.parse(localStorage.getItem("packages")) || [];

if(packages.length === 0){
packages = [
{
title:"Srinagar Tour",
desc:"3 Days Houseboat Stay",
price:"₹9,999",
image:"images/kashmir1.jpg"
},
{
title:"Gulmarg Package",
desc:"Snow Adventure Tour",
price:"₹12,999",
image:"images/kashmir2.jpg"
}
];

localStorage.setItem("packages", JSON.stringify(packages));
}

let container = document.getElementById("packagesContainer");

if(container){
container.innerHTML = packages.map(p => `
<div class="card">
<img src="${p.image}">
<div class="card-body">
<h3>${p.title}</h3>
<p>${p.desc}</p>
<div class="price">${p.price}</div>
</div>
</div>
`).join("");
}

async function loadHeroGuides(){

const { data } = await supabaseClient
.from("guides")
.select("*")
.gte("likes",50)

let html=""

data.forEach(g=>{

html += `
<div class="hero-guide">

<img src="${g.photo || 'https://via.placeholder.com/50'}">

<div class="name">
${g.name}

<span class="tick">
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.67-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z" fill="#1DA1F2"/>
<path d="M9.5 14.58l-2.79-2.79-1.21 1.21 4 4 8-8-1.21-1.21z" fill="#ffffff"/>
</svg>
</span>

</div>

<div class="like" onclick="likeGuide('${g.id}', this)">
❤️ <span>${g.likes || 0}</span>
</div>

</div>
`

})

document.getElementById("heroGuides").innerHTML = html + html

}

async function likeGuide(id, el){

let liked = localStorage.getItem("liked_"+id)

let count = parseInt(el.querySelector("span").innerText)

if(liked){
    
    // UNLIKE
    localStorage.removeItem("liked_"+id)
    el.classList.remove("liked")
    count--

}else{
    
    // LIKE
    localStorage.setItem("liked_"+id,"yes")
    el.classList.add("liked")
    count++

}

if(count < 0) count = 0

el.querySelector("span").innerText = count

await supabaseClient
.from("guides")
.update({ likes: count })
.eq("id", id)

}
