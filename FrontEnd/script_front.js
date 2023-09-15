//Generation dynamique de la galerie
const galerie = document.querySelector(".gallery");
let works = [];

async function getWorks(){
    const r = await fetch("http://localhost:5678/api/works",{
        headers: {
            "accept":"application/json"
        }
    });
    const datajson = await r.json();
    works.push(...datajson);
    return datajson
}
getWorks().then((a) => {
    chargerImages(a)
    return a
})
.then((a)=>{
    chargerFiltres(a)
});

//Appelle la fonction creerVignette autant de fois qu'il y a d'éléments
function chargerImages(a){
    a.forEach(objet => creerVignette(objet));
};

// Créer une vignette avec les données de l'objet et l'insère dans le html 
function creerVignette (element){      
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const figcaption = document.createElement("figcaption");

    img.setAttribute("src",element.imageUrl);
    img.setAttribute("alt",element.title);
    figcaption.textContent = element.title;
    galerie.append(figure);
    figure.append(img, figcaption);
};

//Generation dynamique des filtres et gestion du comportement des boutons filtres
const barreDeFiltres = document.querySelector(".filtres");
const boutonTous = document.querySelector(".filtres button");
boutonTous.classList.add("actif");
boutonTous.addEventListener("click", filtreActif);
boutonTous.addEventListener("click", tousLesProjets); 
let categories = ["tous"];

//Change le style du filtre actif
function filtreActif (event){
    const tousLesFiltres = barreDeFiltres.querySelectorAll("button");
    tousLesFiltres.forEach(bouton => bouton.classList.remove("actif"));
    event.target.classList.add("actif");
};

//Permet au bouton "Tous" de réinitialiser la galerie
function tousLesProjets (){
    galerie.innerHTML="";
    chargerImages(works);
}

//Appelle la fonction creerFiltre autant de fois qu'il y a de catégories
function chargerFiltres (a){
    a.forEach(element =>creerFiltre(element));
};

// Recherche la catégorie de l'élément et l'ajoute à un tableau, génère autant de filtres que de catégories
function creerFiltre (element){
    const name = element.category.name;
    const indice = element["category"]["id"];
    if(categories.includes(name) == false){
        categories.push(name);
        const nouveauFiltre = document.createElement("button");
        nouveauFiltre.innerText= name;
        nouveauFiltre.addEventListener("click", filtreActif);
        nouveauFiltre.addEventListener("click", filtrer);
        barreDeFiltres.append(nouveauFiltre);
    }
    function filtrer (){
        const triCategorie = works.filter(function(element){ return element.category.id == indice;});
        galerie.innerHTML="";
        triCategorie.forEach(objet => creerVignette(objet));
    }
};

// MODE EDITION

//Recherche du token de connexion
if(localStorage.getItem("token")){
    //Affiche "logout" ou lieu de "login"
    const logout = document.getElementById("log");
    logout.innerText="logout";
    logout.style.fontWeight=600;
    logout.setAttribute("href","#");
    //Affiche un bandeau "mode edition" en haut de la page
    const bandeau = document.querySelector(".bandeau-edition");
    bandeau.style.display="flex";
    //Affiche une icone "modifier" à côte de "mes projets" au clic ouvre la MODALE
    const modifierProjets = document.querySelector(".modifier");
    modifierProjets.style.display="flex";
    const modale = document.querySelector("dialog");
    modifierProjets.addEventListener("click", chargerGalerieModale);
    // Masquer les filtres
    barreDeFiltres.style.display="none";
    //Au clic supprime le token, remplace "logout" par "login" cache le bandeau et l'icone modifier remet les filtres
    logout.addEventListener("click", ()=>{
        localStorage.removeItem("token");
        logout.innerText="login";
        logout.style.fontWeight=400;
        setTimeout(()=>{logout.setAttribute("href","login.html"); },500);
        bandeau.style.display="none"; 
        modifierProjets.style.display="none";
        barreDeFiltres.style.display="flex";   
    })
};

//Generation dynamique des images de la modale
const modale = document.querySelector("dialog");
const conteneurImagesModale = document.querySelector(".conteneur-images");
//Apelle la fonction creerItemModale autant de fois que la variable contient d'element, ouvre la modale ensuite
function chargerGalerieModale (){
    conteneurImagesModale.innerHTML="";
    works.forEach(element => creerItemModale(element));
    modale.showModal();
}
//Creer une miniature avec icone poubelle, ajouter style et inserer element dans DOM
function creerItemModale (element){
    const divImgPlusIcone = document.createElement("div");
    divImgPlusIcone.classList.add("conteneur-img-icone");
    const image = document.createElement("img");
    image.setAttribute("src",element.imageUrl);
    image.classList.add("miniature-modale");
    const iconePoubelle = document.createElement("i");
    iconePoubelle.classList.add("fa-solid");
    iconePoubelle.classList.add("fa-trash-can");
    iconePoubelle.setAttribute("id",element.id);
    iconePoubelle.addEventListener("click", supprimer);
    divImgPlusIcone.append(image);
    divImgPlusIcone.append(iconePoubelle);
    conteneurImagesModale.append(divImgPlusIcone);
}

//Fermer la modale au clic des bouton "x"
const boutonFermerModale = document.querySelectorAll(".bouton-fermer-modale");
boutonFermerModale[0].addEventListener("click", ()=>{
    modale.close();
});
boutonFermerModale[1].addEventListener("click", ()=>{
    modaleAjout.close();
});

//Fermer la modale en cliquant à l'extérieur de la boite
modale.addEventListener("click", fermerClicExterieur);
function fermerClicExterieur (e){
    if(e.offsetX > this.offsetWidth || e.offsetX < 0 || e.offsetY > this.offsetHeight || e.offsetY < 0 ){
        this.close();
    }
}
//Supprimer un élément
function supprimer (e){
    const id = e.target.getAttribute("id");
    const token = localStorage.getItem("token");
    fetch("http://localhost:5678/api/works/"+id, {
        method:"DELETE",
        headers: {
            "accept": "*/*",
            "authorization": "Bearer"+" "+token},
    });
}
//Ouvrir la modale pour ajouter un élément depuis le bouton "ajouter une photo"
const boutonAjouter = document.querySelector(".js-ajout");
boutonAjouter.addEventListener("click", ajouterUnePhoto);
//Ferme la modale galerie, ouvre la modale ajout, formulaire reinitialisé
function ajouterUnePhoto (){
    modale.close();
    effacerFormulaire();
    creerCategories();
    modaleAjout.showModal();
}
const modaleAjout = document.getElementById("modale-ajout");
modaleAjout.addEventListener("click", fermerClicExterieur);
const retourModale = document.querySelector(".nav-modale a[href=\"#modale-galerie\"]");
retourModale.addEventListener("click", ()=>{
    modaleAjout.close();
    modale.showModal();
})
//Revient à un formaulaire vide
function effacerFormulaire (){
    apercu.remove();
    iconeFaImage.classList.remove("invisible");
    labelImage.classList.remove("invisible");
    boutonAjouterPhoto.classList.remove("invisible");
    inputTitre.value="";
    inputTitre.classList.remove("invalide");
    messageErreur.innerHTML="";
    messageErreur.classList.remove("erreur");
    selecteurCategorie.classList.remove("invalide");
    erreurCategorie.innerHTML="";
    erreurCategorie.classList.remove("erreur");
}
//Creer dynamiquement la liste d'options "catégorie" du formulaire d'ajout
const selecteurCategorie = document.querySelector("select");
function creerCategories (){
    let listeOptions = categories.slice(1);
    selecteurCategorie.innerHTML="";
    const optionVide = document.createElement("option");
    optionVide.setAttribute("value",null);
    selecteurCategorie.append(optionVide);
    for(choix of listeOptions){
        const option = document.createElement("option");
        option.innerHTML = choix;
        option.setAttribute("value",choix);
        selecteurCategorie.append(option);
    }
}
//Faire apparaitre une image miniature après la sélection d'un fichier
const conteneurUpload = document.querySelector(".conteneur-upload");
const iconeFaImage = document.querySelector(".fa-image");
const inputImage = document.querySelector("input[name=\"image\"]");
const boutonAjouterPhoto = document.querySelector(".bouton-ajouter");
const labelImage = document.querySelector("label[for=\"image\"]");
const apercu = document.createElement("img");

//Validation et affichage du fichier selectionné
inputImage.addEventListener("change", ()=>{
    const lecteurImage = new FileReader();
    lecteurImage.addEventListener("load", (e)=>{
        apercu.classList.add("apercu");
        apercu.src=e.target.result;
        conteneurUpload.prepend(apercu);
        iconeFaImage.classList.add("invisible");
        labelImage.classList.add("invisible");
        boutonAjouterPhoto.classList.add("invisible");
    });
    lecteurImage.readAsDataURL(inputImage.files[0]);
});

//Validation du champ de saisie pour le titre
const inputTitre = document.querySelector("#titre");
inputTitre.addEventListener("change", validerTitre);
const messageErreur = document.querySelector("label[for=titre] span");

function validerTitre (){
    const titre = inputTitre.value;
    const regExTitre = /\w{2,}/;
    if(regExTitre.test(titre)=== false){
        inputTitre.classList.add("invalide");
        messageErreur.classList.add("erreur");
        messageErreur.innerHTML="Titre invalide, 2 lettres min";
    }
    else{
        inputTitre.classList.remove("invalide");
        messageErreur.innerHTML="";
        return true
    }
}
//Validation du choix d'une option dans la liste
selecteurCategorie.addEventListener("change", validerCategorie);
const erreurCategorie = document.querySelector("label[for=categorie] span");

function validerCategorie (){
    if(selecteurCategorie.selectedIndex > 0){
        selecteurCategorie.classList.remove("invalide");
        erreurCategorie.classList.remove("erreur");
        erreurCategorie.innerHTML="";
        return true
    }
    else{
        selecteurCategorie.classList.add("invalide");
        erreurCategorie.classList.add("erreur");
        erreurCategorie.innerHTML="Veuillez choisir une catégorie";
    }
}
//Si image valide, titre valide, catégorie choisie, lance fetch
const formAjout = document.querySelector("dialog form");
formAjout.addEventListener("submit", (event) => {
    event.preventDefault();

    // if(validerMotDePasse(inputPassword.value) && validerCategorie() ){
    //     envoyerImage();
    // }
});






// function handleFiles(files) {
//     var imageType = /^image\//;
//     for (var i = 0; i < files.length; i++) {
//         var file = files[i];
//         if (!imageType.test(file.type)) {
//         alert("veuillez sélectionner une image");
//         }else{
//             if(i == 0){
//                 preview.innerHTML = '';
//             }
//             var img = document.createElement("img");
//             img.classList.add("obj");
//             img.file = file;
//             preview.appendChild(img); 
//             var reader = new FileReader();
//             reader.onload = ( function(aImg) {
//                 return function(e) { 
//                     aImg.src = e.target.result; 
//                     }; 
//             })(img);
    
//             reader.readAsDataURL(file);
//         }
//     }
//  }