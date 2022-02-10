const errorMessage = document.getElementById("signuperror");

const newUser = () => {
    document.getElementById("isuser").style.display = "none";
    document.getElementById("nouser").style.display = "flex";
}

const currentUser = () => {
    document.getElementById("isuser").style.display = "flex";
    document.getElementById("nouser").style.display = "none";
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
        window.close();
      })
      .catch(function (error) {
        console.log(error);
        errorMessage.innerText = "An error occured. Please refresh.";
        errorMessage.classList.remove("hide");
        return;
    });
});