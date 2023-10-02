//Vérification des champs de saisie
const inputEmail = document.querySelector('input[type=email]');
inputEmail.addEventListener("change", validerEmail);

const inputPassword = document.querySelector('input[type=password]');
inputPassword.addEventListener("change",validerMotDePasse);

//Affiche en rouge le champ de l'email si email incorrect
function validerEmail (){
    const valueEmail = inputEmail.value;
    valueEmail.trim();
    const regexEmail = new RegExp ("[a-z0-9._-]+@[a-z0-9._-]+\\.[a-z0-9._-]+");
    const messageErreur = document.querySelector("label[for=email] span");

    if(regexEmail.test(valueEmail)=== false){
        inputEmail.classList.add("invalide");
        messageErreur.classList.add("erreur");
        messageErreur.innerHTML="Email invalide";
    }
    else{
        inputEmail.classList.remove("invalide");
        messageErreur.innerHTML="";
        return true
    }
}

//Affiche en rouge le champ du mot de passe si mot de passe incorrect
function validerMotDePasse (){
    const motDePasse = inputPassword.value;
    motDePasse.trim();
    const regexMotDePasse = new RegExp ("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{6,12}$");
    const messageErreur = document.querySelector("label[for=password] span");

    if(regexMotDePasse.test(motDePasse)=== false){
        inputPassword.classList.add("invalide");
        messageErreur.classList.add("erreur");
        messageErreur.innerHTML="Mot de passe invalide";
    }
    else{
        inputPassword.classList.remove("invalide");
        messageErreur.innerHTML="";
        return true
    }
}

//Login
//Si email et mot de passe valides lance fetch
const form = document.querySelector('form');
form.addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if(validerEmail(inputEmail.value) && validerMotDePasse(inputPassword.value)){
        login();
    }
});
   
//Connexion au serveur
async function login (){

    //Data à envoyer avec fetch
    const identifiants ={
    email : inputEmail.value,
    password : inputPassword.value
    }
    const chargeUtile = JSON.stringify(identifiants);
    //Requete
    try{
        const r = await fetch("http://localhost:5678/api/users/login", {
            method:"POST",
            headers: {  "Content-Type":"application/json",
                        "accept":"application/json"
                    },
            body: chargeUtile
       });
       console.log(r);
       //Accès autorisé
       if(r.ok){
            //Récupération du token de connexion
            const datajson = await r.json();
            const token = datajson["token"];
            //Stockage du token et redirection sur la page d'accueil
            localStorage.setItem("token", token);
            location.href="index.html"; 
        }
        //Accès refusé erreur identifiants
        const messageErreurLogin = document.querySelector("#login p");
        if(r.status >= 400 && r.status<500){
            messageErreurLogin.innerHTML="Accès refusé, email ou mot de passe incorrect";
        }
        //Accès refusé problème serveur
        if(r.status >= 500){
            messageErreurLogin.innerHTML="Echec de la connexion le serveur rencontre un problème";
        }
    }catch(err){
    console.log("err",err);
    }
}   