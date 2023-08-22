const galerie = document.querySelector(".gallery");
const barreDeFiltres = document.querySelector(".filtres");
const boutonTous = document.querySelector(".filtres button");
boutonTous.classList.add("actif");
boutonTous.addEventListener("click", filtreActif);
let categories = ["tous"];

//Recupère les données du portfolio sous forme de tableau
async function creerPortfolio(){
    const r = await fetch("http://localhost:5678/api/works",{
        headers: {
            "accept":"application/json"
        }
    });
    const datajson = await r.json();
    const tableau = Array.from(datajson);

    //Appelle la fonction creerVignette autant de fois qu'il y a d'éléments
    function portfolioInitial (){
        tableau.forEach(objet => creerVignette(objet));
    }
    portfolioInitial();

    //Appelle la fonction creerFiltre autant de fois qu'il y a de catégories
    tableau.forEach(element =>creerFiltre(element));

    //Permet au bouton "Tous" de réinitialiser la galerie
    boutonTous.addEventListener("click", portfolioInitial);

    // Recherche la catégorie de l'élément et l'ajoute à un tableau, génère autant de filtres que de catégories
    function creerFiltre (element){
        const name = element["category"]["name"];
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
            const triCategorie = tableau.filter(function(element){ return element.category.id == indice;});
            galerie.innerHTML="";
            triCategorie.forEach(objet => creerVignette(objet));
        }
    }
}
creerPortfolio();

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

// activer les filtres
function filtreActif (event){
    const tousLesFiltres = barreDeFiltres.querySelectorAll("button");
    tousLesFiltres.forEach(bouton => bouton.classList.remove("actif"));
    event.target.classList.add("actif");
}