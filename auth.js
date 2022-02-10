const newUser = () => {
    document.getElementById("isuser").style.display = "none";
    document.getElementById("nouser").style.display = "flex";
}

const currentUser = () => {
    document.getElementById("isuser").style.display = "flex";
    document.getElementById("nouser").style.display = "none";
}