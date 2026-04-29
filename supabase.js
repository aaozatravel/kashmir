const SUPABASE_URL = "https://yejnsszmvlnmkfqhyfdc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllam5zc3ptdmxubWtmcWh5ZmRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzI2MTYsImV4cCI6MjA4OTkwODYxNn0.0hOShgfmb6NIITSzulKvIePerRa-ofLZ55TU-v3k6s8";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage
  }
});
window.supabaseClient = supabaseClient;


// ================= USER SIGNUP =================
async function signupUser(name, phone, email, password){

if(!name || !phone || !email || !password){
alert("Fill all fields");
return;
}

const { data, error } = await supabaseClient.auth.signUp({
email,
password
});

if(error){
alert(error.message);
return;
}

// save profile
await supabaseClient.from("users").insert([{
id: data.user.id,
name,
phone,
email
}]);

alert("Signup successful ✅");

// auto login
await supabaseClient.auth.signInWithPassword({ email, password });

window.location.href = "account.html";
}


// ================= USER LOGIN =================
async function loginUser(email, password){

if(!email || !password){
alert("Enter email & password");
return;
}

const { error } = await supabaseClient.auth.signInWithPassword({
email,
password
});

if(error){
alert(error.message);
return;
}

alert("Login successful ✅");

// redirect (no reload)
window.location.href = "account.html";
}


// ================= LOGOUT =================
async function logoutUser(){
await supabaseClient.auth.signOut();
window.location.href = "login.html";
}


// ================= LOAD USER (ACCOUNT PAGE) =================
async function loadUser(){

const { data:{ user } } = await supabaseClient.auth.getUser();

if(!user){
window.location.href = "login.html";
return;
}

const { data } = await supabaseClient
.from("users")
.select("*")
.eq("email", user.email)
.single();

if(!data) return;

document.getElementById("userName").innerText = data.name;
document.getElementById("userEmail").innerText = data.email;
document.getElementById("userPhone").innerText = data.phone;

}


// ================= ADMIN LOGIN =================
function loginAdmin(email, password){

// simple admin check (customize)
if(email === "admin@gmail.com" && password === "123456"){
localStorage.setItem("admin","true");
window.location.href = "dashboard.html";
}else{
alert("Invalid admin login");
}

}


// ================= ADMIN CHECK =================
function checkAdmin(){
if(localStorage.getItem("admin") !== "true"){
window.location.href = "login.html";
}
}


// ================= ADMIN LOGOUT =================
function logoutAdmin(){
localStorage.removeItem("admin");
window.location.href = "login.html";
}


// ================= FORGOT PASSWORD =================
async function forgotPassword(email){

if(!email){
alert("Enter email first");
return;
}

const { error } = await supabaseClient.auth.resetPasswordForEmail(email,{
redirectTo: window.location.origin + "/reset-password.html"
});

if(error){
alert(error.message);
return;
}

alert("Reset link sent 📩");

}
