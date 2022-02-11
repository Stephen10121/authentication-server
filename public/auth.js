const errorMessage = document.getElementById("signuperror");

const newUser = () => {
    document.getElementById("isuser").style.display = "none";
    document.getElementById("nouser").style.display = "flex";
}

const currentUser = () => {
    document.getElementById("isuser").style.display = "flex";
    document.getElementById("nouser").style.display = "none";
}

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

const sendAuth = () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const website = urlParams.get('website');
    const key = urlParams.get('key');
    const cookie = getCookie("G_VAR");
    const data = {
        key,
        website,
        cookie
    }

    axios.post('/auth', {
        userData: data
    })
    .then((res) => {
        if (!res) {
            alert("error. check console.");
            return;
        }
        if (res.data.error) {
            console.log(res.data.error);
            alert("error. check console.");
            return;
        }
        alert('success');
      })
      .catch(function (error) {
        console.log(error);
        alert("error. check console.");
        return;
    });
}

document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    let data;
    try {
        data = {
            username: e.target[0].value,
            password: e.target[1].value
        }
    } catch (error) {
        errorMessage.innerText = "An error occured. Please refresh.";
        errorMessage.classList.remove("hide");
        return;
    }
    axios.post('/login', {
        userData: data
      })
      .then((res) => {
        if (!res) {
            errorMessage.innerText = "An error occured. Please refresh.";
            errorMessage.classList.remove("hide");
            return;
        }
        if (res.data.error) {
            errorMessage.innerText = res.data.errorMessage;
            errorMessage.classList.remove("hide");
            return;
        }
        errorMessage.innerText = "Success.";
        errorMessage.classList.remove("hide");
        sendAuth();
      })
      .catch(function (error) {
        console.log(error);
        errorMessage.innerText = "An error occured. Please refresh.";
        errorMessage.classList.remove("hide");
        return;
    });
});