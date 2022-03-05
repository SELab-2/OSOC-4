# Use-cases
## Aanmaken van een project
Korte beschrijving: Een admin maakt een nieuw project aan. \
Precondities: De gebruiker moet een admin zijn, er moet een partner gevonden zijn voor het project. \
Postcondities: Er is een nieuw project aangemaakt met bijbehorende informatie. \
Actoren: Een admin. \
Gedetailleerde beschrijving van de stappen: Een admin maakt een nieuw project aan, hij/zij beschrijft de partner en de doelen van het project, hij/zij beschrijft hoeveel studenten er nodig zijn en welke skills ze moeten hebben, hij/zij voegt coaches toe aan het project, om te eindigen drukt hij/zij op een 'submit' knop. \
Alternatieve flow 1: het aantal studenten en/of de benodigde skills zijn nog niet gekend en worden niet meteen ingevuld, deze informatie wordt later toegevoegd. \
Alternatieve flow 2: Er zijn nog geen coaches gevonden, zij worden dan pas later toegevoegd. \
Alternatieve flow 3: De admin annuleert ergens tijdens het proces het aanmaken van een nieuw project door op 'annuleren' te drukken. \

## Een nieuwe versie 
Korte omschrijving: Een admin maakt een nieuwe versie van de selection tool. \
Precondities: De gebruiker moet een admin zijn. \
Postcondities: Alle projecten/studenten en coaches van de oude versie zijn niet meer zichtbaar in de tool. \
Actoren: Een admin. \
Gedetailleerde beschrijving van de stappen: Een admin drukt op een knop om een nieuwe jaargang te beginnen, het systeem vraagt of de admin zeker is dat hij/zij een nieuwe versie wil starten, de admin drukt op 'ja'. \
Alternatieve flow 1: wanneer het systeem vraagt om bevestiging om een nieuwe versie te beginnen, drukt de admin op 'nee'. \
 
## Rollen veranderen 
Korte omschrijving: Een admin past de rol aan van gebruikers. \
Precondities: De gebruiker die de rollen verandert moet een admin zijn. \
Postcondities: Er moet nog minstens één administrator zijn in het systeem. \
Actoren: Een administrator. \
Gedetailleerde beschrijving van de stappen: Een admin zoekt een bepaalde gebruiker, selecteert de gebruiker, de admin past die gebruiker zijn/haar rol aan (admin/coach/disabled). \

## Coaches toevoegen aan tool
Korte omschrijving: Een admin voegt coaches toe aan de tool.\
Precondities: Een admin en coaches om toe te voegen.\
Postcondities: Coaches werden toegevoegd aan tool.\
Actoren: Admin.\
Gedetailleerde beschrijving van de stappen: Een coach wordt uitgenodigd om zich aan te melden, daarna coach wordt door de admin toegevoegd aan de tool. \

## Aanraden van studenten
Korte omschrijving: Een admin maken samen met coaches een eerste selectie van de studenten. \
Precondities: Er zijn voldoende coaches toegelaten aan de tool en er zijn nog onbeoordeelde studenten. \
Postcondities: Studenten werden beoordeeld.\
Actoren: Een admin en de coaches. \
Gedetailleerde beschrijving van de stappen: De studenten worden door een admin en de coaches in real-time gescreend op basis van hun CV en de antwoorden afkomstig van het inschrijvingsformulier.
De coaches kennen "Yes, Maybe, No" toe aan de studenten. \

## Toekennen van studenten aan projecten
Korte omschrijving: Studenten worden definitief toegekend aan project.\
Precondities: Een admin, studenten die nog niet toegekend zijn en projecten die nog studenten te kort hebben. \
Postcondities: Studenten werden toegekend of niet toegekend.\
Actoren: Een admin. \
Gedetailleerde beschrijving van de stappen: De admin beslist definitief welke studenten welk project krijgen op basis van de suggesties van de coaches en beschikbare projecten. Conflicten waarbij studenten tot 2 projecten worden gematcht worden opgelost. \
Alternatieve flow 1: Er is nood aan een specifiek profiel: er wordt teruggegaan naar het aanraden van studenten.\

## Communicatie naar studenten (toegekend)
Korte omschrijving: Studenten worden op de hoogte gebracht dat ze zijn toegekend aan een project. \
Precondities: Een admin en studenten (die is toegekend aan een project) die nog geen mail ontvangen hebben.\
Postcondities: Alle studenten die zijn toegekend aan een project moeten een mail ontvangen hebben.\
Actoren: Een admin. \
Gedetailleerde beschrijving van de stappen: De studenten worden via mail op de hoogte gebracht dat ze mogen deelnemen aan OSOC. De studenten ondertekenen hun contract. Daarna wordt er praktische info met hen gedeeld en ten slotte worden de studenten voor de eerste keer geïntroduceerd met het project, hun coach en de partner. \
Alternatieve flow 1: Een student ondertekent het contract niet, er wordt een herinneringmail gestuurd. \
Alternatieve flow 2: Een student kan op het laatste momentent toch niet meer meedoen, er wordt teruggegaan naar de use-case "aanraden van studenten".\

## Communicatie naar studenten (niet toegekend)
Korte omschrijving: Studenten worden op de hoogte gebracht dat ze niet zijn toegekend aan een project. \
Precondities: Een admin en studenten (die niet is toegekend aan een project) die nog geen mail ontvangen hebben.\
Postcondities: Alle studenten die niet zijn toegekend aan een project moeten een mail ontvangen hebben.\
Actoren: Een admin. \
Gedetailleerde beschrijving van de stappen: De studenten worden via mail op de hoogte gebracht dat ze niet mogen deelnemen aan OSOC. \