document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const gegevensContainer = document.getElementById('voorkeuren');
    const weergegevensContainer = document.getElementById('weergegevens');
    const voorzieningenContainer = document.getElementById('voorzieningen');
    const bezoeksduurContainer = document.getElementById('bezoeksduur');


    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            
            gegevensContainer.innerHTML = "";
            weergegevensContainer.innerHTML = "";
            voorzieningenContainer.innerHTML = "";
            bezoeksduurContainer.innerHTML= "";

            const data = JSON.parse(e.target.result);

            // Voorkeuren weergeven
            const bezoekersvoorkeurenDiv = document.createElement('div');
            bezoekersvoorkeurenDiv.classList.add('voorkeur');
            let bezoekersvoorkeurenHTML = ``;

            if (data.bezoekersgegevens) {
                const nameHeader = document.createElement('h1');
                nameHeader.textContent = `${data.bezoekersgegevens["naam"]}s dagprogramma 🎢🎉🎉`;
                gegevensContainer.appendChild(nameHeader);
    
                Object.keys(data.bezoekersgegevens).forEach(key => {
                    bezoekersvoorkeurenHTML += `<div class="voorkeur-info">${key.charAt(0).toUpperCase() + key.slice(1)}: ${data.bezoekersgegevens[key]}</div>`;
                });
            } else {
                // Voorkeuren niet volgens format in JSON aanwezig.
                bezoekersvoorkeurenHTML += `<div class="voorkeur-info">Hier moeten de bezoekersgegevens komen. </div>`;
            }

            bezoekersvoorkeurenDiv.innerHTML = bezoekersvoorkeurenHTML;
            gegevensContainer.appendChild(bezoekersvoorkeurenDiv);

          
            // Weergegevens weergeven
            const weergegevensDiv = document.createElement('div');
            weergegevensDiv.classList.add('voorkeur');
            let weergegevensHTML = ``;
            if (data.weergegevens) {
                weergegevensHTML += '<div class="voorkeur-info">Weergegevens 🌞</div>'
                Object.keys(data.weergegevens).forEach(key => {
                    weergegevensHTML += `<div class="voorkeur-info">${key.charAt(0).toUpperCase() + key.slice(1)}: ${data.weergegevens[key]}</div>`;
                });
            } else {
                // Weergegevens niet volgens format in JSON aanwezig.
                weergegevensHTML += `<div class="voorkeur-info">Hier moeten weergegevens komen. </div>`;
            }
       
            weergegevensDiv.innerHTML = weergegevensHTML;
            weergegevensContainer.appendChild(weergegevensDiv);

            // Voorzieningen weergeven
            aantalAttracties = 0;
            if (data.voorzieningen && data.voorzieningen.length > 0) {
                data.voorzieningen.forEach((voorziening) => {
                    const li = document.createElement('li');
                    if (voorziening.type && (voorziening.type.toLowerCase() == "horeca" || voorziening.type.toLowerCase() == "winkel")) {
                        li.classList.add(voorziening.type.toLowerCase() + "-item");
                        li.innerHTML = `
                                 <div class="time"><b> ${voorziening.naam} (${voorziening.productaanbod})</b></div>
                                    <p>
                                        Wachttijd: ${voorziening.geschatte_wachttijd} minuten (doorlooptijd: ${voorziening.doorlooptijd} minuten)<br>
                                    </p>`;
                    } else if (voorziening.type && voorziening.type.toLowerCase() == "eetpauze") {
                        li.classList.add('pauze-item')
                        li.innerHTML = `<div class="time"><b>☕ Eetpauze</b></div>
                                        <p> Duur: ${voorziening.duur} minuten <br></p>`;
                    } 
                    else {
                        aantalAttracties++;
                        li.classList.add("attractie-item")
                        if (voorziening.is_favoriet) {
                            li.classList.add("favoriet");
                        }
                        li.innerHTML = `
                                 <div class="time"><b> #${aantalAttracties} - ${voorziening.naam} (${voorziening.type})</b></div>
                                    <p>
                                        Wachttijd: ${voorziening.geschatte_wachttijd} minuten (doorlooptijd: ${voorziening.doorlooptijd} minuten)<br>
                                        Minimum-maximum lengte: ${voorziening.attractie_min_lengte || 'Geen beperking'} - ${voorziening.attractie_max_lengte || 'Geen beperking'}<br>
                                        Minimum leeftijd: ${voorziening.attractie_min_leeftijd || 'Geen beperking'}<br>
                                        Maximum gewicht: ${voorziening.attractie_max_gewicht || 'Geen beperking'}
                                    </p>`;
    
                    }
               
                    voorzieningenContainer.appendChild(li);
                });
            } else {
                const voorzieningenDiv = document.createElement('li');
                voorzieningenDiv.innerHTML = "<div>Hier moeten voorzieningen komen. <\div>"
                voorzieningenContainer.appendChild(voorzieningenDiv)
            }
            

            // Totale bezoekersduur weergeven
            const bezoekersduurGegevensDiv = document.createElement('div');
            bezoekersduurGegevensDiv.classList.add('voorkeur');
            bezoekersduurGegevensDiv.innerHTML = `<div class="voorkeur-info"> Totaal geplande tijd: ${data.totale_duur} minuten<\div>`
            bezoeksduurContainer.appendChild(bezoekersduurGegevensDiv)
        };
        reader.readAsText(file);
    });
});
