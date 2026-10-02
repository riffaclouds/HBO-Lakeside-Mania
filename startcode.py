# import modulen
from pathlib import Path
import json
import pprint
from database_wrapper import Database

# 1 Database initialisatie en verbinden
# Inloggegevens naar mijn lokale Docker mysql-container
db = Database(host="127.0.0.1", gebruiker="root", wachtwoord="root", database="attractiepark_casus_a")
db.connect()

# 2 Bezoeker inlezen (FR2)
bezoeker_id = 1 # Pas aan naar 2 of 3 voor een andere bezoeker

# SQL-query: Selecteer bezoeker uit database
select_query_bezoeker = f"SELECT * FROM bezoeker WHERE id = {bezoeker_id}"
resultaat_bezoeker = db.execute_query(select_query_bezoeker)
bezoeker = resultaat_bezoeker[0] # Pak de eerste en enigste rij

# 3 Geschikte attracties ophalen (FR5)
# Filter attracties waar de bezoeker fysiek in mag met SQL
# NULL betekent in de db dat er geen limiet is.
query_attracties = f"""
    SELECT * FROM voorziening 
    WHERE type NOT IN ('horeca', 'winkel', 'eetpauze') 
    AND (attractie_min_lengte IS NULL OR attractie_min_lengte <= {bezoeker['lengte']})
    AND (attractie_max_lengte IS NULL OR attractie_max_lengte >= {bezoeker['lengte']})
    AND (attractie_min_leeftijd IS NULL OR attractie_min_leeftijd <= {bezoeker['leeftijd']})
    AND (attractie_max_gewicht IS NULL OR attractie_max_gewicht >= {bezoeker['gewicht']})
"""
geschikte_attracties = db.execute_query(query_attracties)

# 4 Horeca ophalen (FR9)
# Splits de string ("Patat,Snoep,IJs") en pak eerste voorkeur
voorkeuren_eten = bezoeker['voorkeuren_eten'].split(',') if bezoeker['voorkeuren_eten'] else []
eerste_voorkeur = voorkeuren_eten[0] if voorkeuren_eten else ""

# Zoek horeca die het gekozen eten verkoopt. LIMIT 1 omdat we maar 1 tent nodig hebben.
query_horeca = f"SELECT * FROM voorziening WHERE type = 'horeca' AND productaanbod LIKE '%{eerste_voorkeur}%' LIMIT 1"
geschikte_horeca = db.execute_query(query_horeca)

db.close() # Verbinding sluiten

# 5 JSON Structuur Opbouwen (FR3 & NFR4)
# db kolommen omzetten naar json format
bezoekersgegevens = {
    "naam": bezoeker['naam'],
    "verblijfsduur": bezoeker['verblijfsduur'],
    "leeftijd": bezoeker['leeftijd'],
    "lengte": bezoeker['lengte'],
    "gewicht": bezoeker['gewicht'],
    "voorkeuren_attractietypes": bezoeker['voorkeuren_attractietypes'].split(',') if bezoeker['voorkeuren_attractietypes'] else [],
    "lievelingsattracties": bezoeker['lievelingsattracties'].split(',') if bezoeker['lievelingsattracties'] else [],
    "voorkeuren_eten": voorkeuren_eten,
    "rekening_houden_met_weer": bool(bezoeker['rekening_houden_met_weer'])
}

voorzieningen_lijst = []
totale_duur = 0

# Tijdelijk 3 attracties toevoegen voor deze test
for attractie in geschikte_attracties[:3]:
    voorzieningen_lijst.append(attractie)
    totale_duur += attractie['doorlooptijd'] + attractie['geschatte_wachttijd']

# Horeca toevoegen (FR9)
if geschikte_horeca:
    horeca_item = geschikte_horeca[0]
    voorzieningen_lijst.append(horeca_item)
    totale_duur += horeca_item['doorlooptijd'] + horeca_item['geschatte_wachttijd']

dagprogramma = {
    "bezoekersgegevens": bezoekersgegevens,
    "weergegevens": {
        "temperatuur": 21,
        "kans_op_regen": 10
    },
    "voorzieningen": voorzieningen_lijst,
    "totale_duur": totale_duur
}

# 6 JSON weg schrijven
output_bestand = f'dagprogramma_bezoeker_{bezoeker_id}.json'
with open(output_bestand, 'w') as json_bestand_uitvoer:
    json.dump(dagprogramma, json_bestand_uitvoer, indent=4)

print(f"Json succesvol gegenereerd: {output_bestand}")
