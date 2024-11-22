

export interface Book {
  name: string; // Nom du service
  commune: string; // Nom de la commune
  postalCode: string; // Code postal
  latitude: string; // Latitude
  longitude: string; // Longitude
  dayStart: string; // Jour de début (ex. "Mardi")
  dayEnd: string; // Jour de fin (ex. "Vendredi")
  startTime: string; // Heure d'ouverture (ex. "09:00:00")
  endTime: string; // Heure de fermeture (ex. "12:00:00")
  id: string;
}