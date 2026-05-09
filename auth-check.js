let authChecked = false;

// 🔥 login check after 10 sec
setTimeout(() => {

  supabaseClient.auth.getSession().then(({ data }) => {

    const session = data.session;

    if (!session) {
      window.location.href = "login.html";
    } else {
      authChecked = true;
      console.log("User logged in");
    }

  });

}, 10 * 1000); // 10 seconds

// 🔥 realtime auth tracking
supabaseClient.auth.onAuthStateChange((event, session) => {

  if (event === "SIGNED_OUT") {

    setTimeout(() => {
      window.location.href = "login.html";
    }, 25 * 1000);

  }

  if (event === "SIGNED_IN") {
    authChecked = true;
  }

});