// const elementsPortfolio = fetch("http://localhost:5678/api/works")
//     .then(response => response.json())
//     .then(response => alert(JSON.stringify(response)))
//     .catch(error => alert("Erreur" + error));

// fetch("http://localhost:5678/api/works")
    // .then( elementsPortfolio => elementsPortfolio.json())
    // .then(body => console.log(body))

//  async function recuperePortfolio(){
//     const r = await fetch("http://localhost:5678/api/works",{
//         headers: {
//             "accept":"application/json"
//         }
//     });
//     if(r.ok === true){
//         return r.json();
//     }
//     throw new Error("echec de récupération des données serveur")
//  }
//  recuperePortfolio().then(r => nombre += r.length)

const galerie = document.querySelector(".gallery");

/*Recupère les données du portfolio sous forme de tableau et appelle la fonction creerVignette
autant de fois qu'il y a d'éléments*/
async function creerPortfolio(){
    const r = await fetch("http://localhost:5678/api/works",{
        headers: {
            "accept":"application/json"
        }
    });
    const datajson = await r.json();
    datajson.forEach(objet => creerVignette(objet)); 
}
creerPortfolio();

// Créer une vignette avec les données de l'objet et l'insère dans le html 
function creerVignette (element) {
            
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const figcaption = document.createElement("figcaption");

    img.setAttribute("src",element.imageUrl);
    img.setAttribute("alt",element.title);
    
    figcaption.textContent = element.title;

    galerie.append(figure);
    figure.append(img, figcaption);
};






