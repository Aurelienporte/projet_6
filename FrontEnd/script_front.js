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

function chargerGalerieModale (){
    conteneurImagesModale.innerHTML="";
    works.forEach(element => creerItemModale(element));
    modale.showModal();
}
function creerItemModale (element){
    const divImgPlusIcone = document.createElement("div");
    divImgPlusIcone.classList.add("conteneur-img-icone");
    const image = document.createElement("img");
    image.setAttribute("src",element.imageUrl);
    image.classList.add("miniature-modale");
    const iconePoubelle = document.createElement("i");
    iconePoubelle.classList.add("fa-solid");
    iconePoubelle.classList.add("fa-trash-can");
    divImgPlusIcone.append(image);
    divImgPlusIcone.append(iconePoubelle);
    conteneurImagesModale.append(divImgPlusIcone);
}

//Fermer la modale au clic du bouton "x" ou clic en dehors de la boite
const boutonFermerModale = document.querySelector(".bouton-fermer-modale");
boutonFermerModale.addEventListener("click", () => {
    modale.close();
});
modale.addEventListener("click", (e) => {
    if(e.offsetX > modale.offsetWidth || e.offsetX < 0 || e.offsetY > modale.offsetHeight || e.offsetY < 0 ){
        modale.close();
    }
});