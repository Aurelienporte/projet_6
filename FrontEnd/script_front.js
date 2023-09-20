//Generation dynamique de la galerie
const galerie = document.querySelector(".gallery");
let works = [];
//Requete serveur - Récupération des travaux
try{
    async function getWorks(){
        const r = await fetch("http://localhost:5678/api/works",{
            method:"GET",
            headers: {
                "accept":"application/json"
            }
        });
        //Traitement de la réponse et stockage dans la variable works
        if(r.ok){
            const datajson = await r.json();
            works.push(...datajson);
            return datajson
        }
    }
    getWorks().then((a) => {
        chargerImages(a)
        return a
    })
    .then((a)=>{
        chargerFiltres(a)
    });
}
catch(err){
    console.log("erreur :",err);
}

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
modale.addEventListener("click", (e) => {
    if(e.x < modale.offsetLeft || e.x > (modale.offsetLeft + modale.offsetWidth) || e.y < modale.offsetTop || e.y > (modale.offsetTop + modale.offsetHeight)){
        modale.close();
    }
});

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
const boutonAjouter = document.querySelector("#js-ajout");
boutonAjouter.addEventListener("click", ajouterUnePhoto);
const modaleAjout = document.getElementById("modale-ajout");

//Ferme la modale galerie, ouvre la modale ajout, formulaire reinitialisé
function ajouterUnePhoto (){
    modale.close();
    effacerFormulaire();
    creerCategories();
    modaleAjout.showModal();
}

//Fermer la modale au clic à l'extérieur de la boite
modaleAjout.addEventListener("click", (e)=>{
    if(e.x < modaleAjout.offsetLeft || e.x > (modaleAjout.offsetLeft + modaleAjout.offsetWidth) || e.y < modaleAjout.offsetTop || e.y > (modaleAjout.offsetTop + modaleAjout.offsetHeight)){
        modaleAjout.close();
    }
});

//Revenir à la modale galerie au clic sur la flèche
const retourModale = document.querySelector(".nav-modale a[href=\"#modale-galerie\"]");
retourModale.addEventListener("click", ()=>{
    modaleAjout.close();
    modale.showModal();
})

//Reinitialiser le formulaire
function effacerFormulaire (){
    apercu.remove();
    erreurImage.innerHTML="";
    iconeFaImage.classList.remove("invisible");
    labelImage.classList.remove("invisible");
    boutonAjouterPhoto.classList.remove("invisible");
    resultatValidationImg = false;
    inputTitre.value="";
    inputTitre.classList.remove("invalide");
    resultatValidationTitre =false;
    messageErreur.innerHTML="";
    selecteurCategorie.classList.remove("invalide");
    erreurCategorie.innerHTML="";
    resultatValidationCategorie= false;
    boutonValider.classList.remove("ok");
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

//Gestion de input type=file
const conteneurUpload = document.querySelector(".conteneur-upload");
const iconeFaImage = document.querySelector(".fa-image");
const inputImage = document.querySelector("input[name=\"image\"]");
const boutonAjouterPhoto = document.querySelector(".bouton-ajouter");
const labelImage = document.querySelector("label[for=\"image\"]");
const apercu = document.createElement("img");

//Validation et affichage du fichier image selectionné
const erreurImage = document.querySelector("label[for=\"image\"]>p span");
const formats = ["jpeg", "jpg", "png"];
let resultatValidationImg = false;

inputImage.addEventListener("change", ()=>{
    const fichier = inputImage.files[0];
    const lecteurImage = new FileReader();

    lecteurImage.addEventListener("load", (e)=>{
        
        let nombreEchecs = 0;

        for(let i = 0; i < formats.length; i++){
            const regExImage = new RegExp ("^image\/"+formats[i]);
            //Format correct
            if(regExImage.test(fichier.type)){
                //Format ok et taille inférieure à 4Mo
                if(fichier.size < 4*1024*10**3){
                    apercu.classList.add("apercu");
                    apercu.src=e.target.result;
                    conteneurUpload.prepend(apercu);
                    iconeFaImage.classList.add("invisible");
                    labelImage.classList.add("invisible");
                    boutonAjouterPhoto.classList.add("invisible");
                    resultatValidationImg = true;
                    if(resultatValidationImg && resultatValidationTitre && resultatValidationCategorie){
                        boutonValider.classList.add("ok");
                    }
                }
                //Format ok mais taille supérieure à 4Mo
                else{
                    erreurImage.innerHTML="Le fichier est trop volumineux : ";
                    resultatValidationImg = false;
                }
            }
            //Format incorrect
            else{
                nombreEchecs += 1;
                if(nombreEchecs == formats.length){
                    erreurImage.innerHTML="Veuillez sélectionner une image au format suivant : ";
                    resultatValidationImg = false;
                }
            }
        }
    });
    lecteurImage.readAsDataURL(fichier);
});

//Validation du champ de saisie pour le titre
const inputTitre = document.querySelector("#titre");
inputTitre.addEventListener("keydown", (e)=>{
    if(e.key =="Enter"){
        e.preventDefault();
    }
})
inputTitre.addEventListener("change", validerTitre);
const messageErreur = document.querySelector("label[for=titre] span");
let resultatValidationTitre = false

function validerTitre (){
    const titre = inputTitre.value;
    const regExTitre = /\w{2,}/;
    if(regExTitre.test(titre)=== false){
        inputTitre.classList.add("invalide");
        messageErreur.innerHTML="Titre invalide, 2 lettres min";
        boutonValider.classList.remove("ok");
        resultatValidationTitre = false;
    }
    else{
        inputTitre.classList.remove("invalide");
        messageErreur.innerHTML="";
        resultatValidationTitre= true;
        if(resultatValidationImg && resultatValidationTitre && resultatValidationCategorie){
            boutonValider.classList.add("ok");
        }
    }
}
//Validation du choix d'une option dans la liste
selecteurCategorie.addEventListener("change", validerCategorie);
const erreurCategorie = document.querySelector("label[for=categorie] span");
let resultatValidationCategorie = false;
function validerCategorie (){
    if(selecteurCategorie.selectedIndex > 0){
        selecteurCategorie.classList.remove("invalide");
        erreurCategorie.innerHTML="";
        resultatValidationCategorie = true;
        if(resultatValidationImg && resultatValidationTitre && resultatValidationCategorie){
            boutonValider.classList.add("ok");
        }
    }
    else{
        selecteurCategorie.classList.add("invalide");
        erreurCategorie.innerHTML="Veuillez choisir une catégorie";
        resultatValidationCategorie = false;
        boutonValider.classList.remove("ok");
    }
}
//Si image valide, titre valide, catégorie choisie, lance fetch

const formAjout = document.querySelector("dialog form");
const boutonValider = document.querySelector("#js-valider");

formAjout.addEventListener("submit", (event) => {
    event.preventDefault();
    posterImage();
});

async function posterImage (){
const imagePost = await inputImage.files[0].text();

        //Data à envoyer avec fetch
    const dataEnvoi ={
        image : imagePost,
        title : inputTitre.value,
        category : selecteurCategorie.value
    }
    const chargeUtile = JSON.stringify(dataEnvoi);
    console.log(dataEnvoi)

    //Requete
    const token = localStorage.getItem("token");
    
    const r = await fetch("http://localhost:5678/api/works", {
        method:"POST",
        headers: {  "Content-Type":"multipart/form-data",
                    "accept":"application/json",
                    "authorization": "Bearer"+" "+token
                },
        body: chargeUtile
    });
    console.log(r);
}