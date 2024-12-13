export interface APIArbre {
  commune: string;
  domaine: string;
  code_insee: string;
  matricule: string;
  nom_francais: string;
  nom_latin: string;
  nb_sujet: number;
  annee_plantation: string | null;
  critere_general: string;
  critere_autre: string;
  hauteur: number;
  circonference: number;
  envergure: number;
  date_releve: string;
  description_etat_sanitaire: string;
  description_sol: string;
  photo_associee: string;
  geo_point_2d: { lat: number; lon: number };
  photo: {
thumbnail:true,
  filename: string,
    format: string,
    width:string,
    etag:string,
    mimetype:string,
    id:string,
    last_synchronized:string,
    height:string,
    color_summary:[
        "rgba(173, 181, 148, 1.00)",
        "rgba(107, 121, 82, 1.00)",
        "rgba(103, 110, 96, 1.00)"
    ]
    ,
    url:string

}
,
}